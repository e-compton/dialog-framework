'use strict';

const debug = require('debug')('dialog-framework/Dialog');

/** Represents the current state of the dialog flow. */
class Dialog {

  /**
   * Creates a new instance of Dialog without the need for the new keyword
   * @returns {Dialog}
   */
  static create() {
    return new Dialog(...arguments);
  }

  /**
   * @private
   */
  static _getDefaultContext() {
    return {
      user: {},
      system: {
        _turn: 0,
        _stack: []
      }
    };
  }

  /**
   * @param {String} message - The most recent user message send to the chatbot
   * @param {Context} context - The context from previous runs
   */
  constructor(message, context) {
    this.context = context || Dialog._getDefaultContext();
    this.context.input = message;
    this.lastPopped = {};
  }

  /**
    * @returns {number} the number of times the current agent has been active consecutively
    */
  loopCount() {
    return this.lastPopped.loop || 0;
  }

  /** Pops the next agent from the dialog stack and sets it to be active
    * @returns {AgentDescription}
    */
  pop() {
    let popped = this.context.system._stack.pop();
    if (popped) {
      this.lastPopped = popped;
    }
    debug('Popped agent:', popped);
    return popped;
  }

  /**
    * Pushes an agent to the top of the dialog stack
    * @param {String} agentLabel - the label that represents the agent
    * @returns {AgentDescription}
    */
  push(agentLabel) {
    if (agentLabel === this.lastPopped.agentLabel) {
      this.lastPopped.loop += 1;
      debug(`Pushing ${agentLabel} with count ${this.lastPopped.loop}`);
      return this.context.system._stack.push(this.lastPopped);
    }

    debug(`Pushing ${agentLabel}`);
    return this.context.system._stack.push({
      agentLabel,
      loop: 0
    });
  }
}

module.exports = Dialog;
