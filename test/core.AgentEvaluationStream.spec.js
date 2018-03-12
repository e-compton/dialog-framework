'use strict';

const assert = require('assert');
const sinon = require('sinon');

const AgentEvaluationStream = require('../src/AgentEvaluationStream');

describe('AgentEvaluationStream', () => {
  let annotators, agents, dialog, evaluationStream;

  beforeEach(() => {
    annotators = [
      sinon.stub(),
      sinon.stub()
    ];

    agents = {
      root: sinon.stub(),
      other: sinon.stub(),
      another: sinon.stub()
    };

    dialog = {
      pop: sinon.stub(),
      push: sinon.stub(),
      context: 'the context'
    };

    evaluationStream = AgentEvaluationStream.create(annotators, agents, dialog);
  });

  it('Single agent immediately prompts', done => {
    dialog.pop.onCall(0).returns({ agentLabel: 'root' });
    agents.root.resolves({ message: 'hello world', prompt: true });

    let result = [];
    evaluationStream.on('data', data => {
      result.push(data);
    });

    evaluationStream.on('error', () => {
      assert(false);
    });

    evaluationStream.on('end', () => {
      assert(dialog.pop.calledOnce);
      assert(agents.root.calledOnce);

      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        message: 'hello world', context: 'the context'
      });
      done();
    });
  });

  it('Multiple agents', done => {
    dialog.pop.onCall(0).returns({ agentLabel: 'another'});
    dialog.pop.onCall(1).returns({ agentLabel: 'other'});
    dialog.pop.onCall(2).returns({ agentLabel: 'root'});

    agents.another.resolves();
    agents.other.resolves({message: 'hi'});
    agents.root.resolves({message: 'hello', prompt: true});

    let result = [];
    evaluationStream.on('data', data => {
      result.push(data);
    });

    evaluationStream.on('error', () => {
      assert(false);
    });

    evaluationStream.on('end', () => {
      assert(dialog.pop.calledThrice);
      assert(agents.another.calledOnce);
      assert(agents.another.calledWith(dialog));
      assert(agents.other.calledOnce);
      assert(agents.other.calledWith(dialog));
      assert(agents.root.calledOnce);
      assert(agents.root.calledWith(dialog));

      assert.strictEqual(result.length, 2);
      assert.deepStrictEqual(result[0], {
        message: 'hi', context: 'the context'
      });
      assert.deepStrictEqual(result[1], {
        message: 'hello', context: 'the context'
      });
      done();
    });
  });

  it('empty stack root pushed nothing', done => {
    agents.root.resolves();
    dialog = {
      push: function (agentLabel) { this.stack.push({ agentLabel }); },
      pop: function () { return this.stack.pop(); },
      stack: [],
      context: 'the context'
    };
    evaluationStream = AgentEvaluationStream.create(annotators, agents, dialog);

    let result = [];
    evaluationStream.on('data', data => {
      result.push(data);
    });

    evaluationStream.on('error', err => {
      assert.strictEqual(err.message, 'Pushed root agent more than 10 times. Is this an infinite loop?');
      assert.strictEqual(agents.root.callCount, 10);
      assert(agents.root.alwaysCalledWith(dialog));
      assert.strictEqual(result.length, 0);
      done();
    });
  });

  it('prompt before stack is empty', done => {
    dialog.pop.onCall(0).returns({ agentLabel: 'another'});
    dialog.pop.onCall(1).returns({ agentLabel: 'other'});
    dialog.pop.onCall(2).returns({ agentLabel: 'root'});

    agents.another.resolves();
    agents.other.resolves({ message: 'hi', prompt: true });
    agents.root.resolves({ message: 'hello', prompt: true });

    let result = [];
    evaluationStream.on('data', data => {
      result.push(data);
    });

    evaluationStream.on('error', () => {
      assert(false);
    });

    evaluationStream.on('end', () => {
      assert(dialog.pop.calledTwice);
      assert(agents.another.calledOnce);
      assert(agents.another.calledWith(dialog));
      assert(agents.other.calledOnce);
      assert(agents.other.calledWith(dialog));
      assert(!agents.root.called);

      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        message: 'hi', context: 'the context'
      });
      done();
    });
  });

  it('bad agent pushed', done => {
    dialog.pop.onCall(0).returns({ agentLabel: 'another'});
    dialog.pop.onCall(1).returns({ agentLabel: 'other'});
    dialog.pop.onCall(2).returns({ agentLabel: 'rosot'});

    agents.another.resolves();
    agents.other.resolves({ message: 'hi' });
    agents.root.resolves({ message: 'hello', prompt: true });

    let result = [];
    evaluationStream.on('data', data => {
      result.push(data);
    });

    evaluationStream.on('error', err => {
      assert.strictEqual(err.message, 'No agent with label: rosot');
      assert(dialog.pop.calledThrice);
      assert(agents.another.calledOnce);
      assert(agents.another.calledWith(dialog));
      assert(agents.other.calledOnce);
      assert(agents.other.calledWith(dialog));
      assert(!agents.root.called);

      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        message: 'hi', context: 'the context'
      });
      done();
    });

    evaluationStream.on('end', () => {
    });
  });
});
