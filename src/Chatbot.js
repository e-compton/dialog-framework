'use strict';

const debug = require('debug')('dialog-framework/Chatbot');

const Dialog = require('./Dialog');
const AgentEvaluationStream = require('./AgentEvaluationStream');

class Chatbot {
  constructor() {
    this.agents = {};
    this.annotators = [];
  }

  chat(message, context) {
    let dialog = new Dialog(context, message);
    return AgentEvaluationStream.create(this.annotators, this.agents, dialog);
  }

  registerAgent(label, agent) {
    if (this.agentStore[label]) {
      debug(`Warning: Agent ${label} already registered, overwriting`);
    }
    this.agentStore[label] = agent;
  }

  registerRootAgent(agent) {
    this.registerAgent(agent);
  }

  registerAnnotator(annotator) {
    this.annotatorStore.push(annotator);
  }
}

module.exports = Chatbot;
