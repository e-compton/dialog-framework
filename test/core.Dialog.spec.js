'use strict';

const assert = require('assert');

const Dialog = require('../src/Dialog');

describe('Dialog', () => {
  let dialog, myItem;
  beforeEach(() => {
    dialog = Dialog.create();
    myItem = {
      agentLabel: 'thing',
      loop: 0
    };
  });

  it('getDefaultContext', () => {
    let result = Dialog._getDefaultContext();

    assert.deepStrictEqual(result, {
      user: {},
      system: {
        _turn: 0,
        _stack: []
      }
    });
  });


  it('pop empty stack', () => {
    let poppedItem = dialog.pop(); //should be null
    assert.strictEqual(poppedItem, undefined);
  });

  it('pop non-empty stack', () => {
    let myItem = {
      agentLabel: 'thing',
      loop: 0
    };
    dialog.context.system._stack.push(myItem);

    let poppedItem = dialog.pop(); //should be null
    assert.strictEqual(poppedItem, myItem);
  });

  it('loop count no pushed items', () => {
    let result = dialog.loopCount();
    assert.strictEqual(result, 0);
  });

  it('loop count with one item', () => {
    dialog.context.system._stack.push(myItem);
    let result = dialog.loopCount();
    assert.strictEqual(result, 0);
  });

  it('loop count with item but the loop count is 0 this time', () => {
    dialog.push(myItem.agentLabel);
    dialog.pop();
    dialog.push(myItem.agentLabel);
    dialog.pop();
    let result = dialog.loopCount();
    assert.strictEqual(result, 1);
  });
});
