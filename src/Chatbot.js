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
    let dialog = new Dialog(message, context);
    return AgentEvaluationStream.create(this.annotators, this.agents, dialog);
  }

  registerAgent(label, agent) {
    if (this.agents[label]) {
      debug(`Warning: Agent ${label} already registered, overwriting`);
    }
    this.agents[label] = agent;
  }

  registerRootAgent(agent) {
    this.registerAgent('root', agent);
  }

  registerAnnotator(annotator) {
    this.annotators.push(annotator);
  }
}

module.exports = Chatbot;
