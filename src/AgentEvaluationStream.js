'use strict';

const debug = require('debug')('dialog-framework/core/AgentEvaluationStream');
const { Readable } = require('stream');

class AgentEvaluationStream extends Readable {
  static create() {
    return new AgentEvaluationStream(...arguments);
  }

  constructor(annotators, agents, dialog) {
    super({ objectMode: true });
    this.annotators = annotators;
    this.agents = agents;
    this.dialog = dialog;
    this.rootAgentCount = 0;
    this.done = false;
  }

  _read(cb) {
    this.__read().then(cb).catch(err => this.emit('error', err));
  }

  async __read() {
    if (this.done) {
      debug('Evaluation Complete');
      return this.push(null);
    }

    let agentResult = {};
    let agentDescriptor = this.dialog.pop();
    
    if (!agentDescriptor) {
      this.dialog.push('root');
      this.rootAgentCount += 1;
      debug('Stack is empty pushing rootAgent, count:', this.rootAgentCount);
      if (this.rootAgentCount > 10) {
        this.done = true;
        throw new Error('Pushed root agent more than 10 times. Is this an infinite loop?');
      }

      return this.__read();
    }
    let { agentLabel } = agentDescriptor;
    debug('Retrieving agent:', agentLabel);
    let agent = this.agents[agentLabel];
    if (!agent) {
      throw new Error('No agent with label: ' + agentLabel);
    }

    debug('Calling agent:', agentLabel);
    agentResult = await agent(this.dialog) || {};

    debug(agentLabel, 'resolved to', agentResult);
    this.done = !!agentResult.prompt || false;

    if (agentResult.message) {
      let data = {
        message: agentResult.message,
        context: this.dialog.context
      };
      debug('Emitting data:', data);
      return this.push(data);
    }

    return this.__read();
  }
}

module.exports = AgentEvaluationStream;
