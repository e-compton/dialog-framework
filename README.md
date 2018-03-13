# Dialog Framework

Dialog Framework is a framework for building complex asynchronous javascript
chatbots in node.js. It is designed to work in stateless systems and to provide as much flexibility to the user as possible.

Install with:

```sh
npm i dialog-framework
```

## Hello world example

```js
const Chatbot = require('dialog-framework');

let annotators = [
  async dialog => dialog
];

let agents = {
  root: async dialog => { message: 'hello world!', prompt: true }
};
let chatbot = Chatbot.create(annotators, agents);
let response = chatbot.chat('hi');
response.on('data', (data) => console.log(data.message)); // hello world
```

## Annotators and Agents
Chatbots consists of two components *Annotators* and *Agents*.

An annotator is any function that takes an instance of `Dialog` as input and returns a promise that resolves to the same dialog.

```js
let myAnnotator = async function (dialog) {
  dialog.context.sentiment = await analyseSentiment(dialog.context.input);
  return dialog;
}
```

An agent is any function that takes a `Dialog` as input and returns a promise that resolves to an object with any of the following properties or null:
- message (any type): to be emitted back to the user
- prompt (boolean): the dialog pauses for further user input

```js
agents['root'] = async function (dialog) {
  if (dialog.context.input.includes('hello')) {
    dialog.push('greetings');
    return;
  } else {
    return { message: 'I\'m sorry, I don\'t understand', prompt: true };
  }
}

agents['greetings'] = async function (dialog) {
  return { message: 'hello world!', prompt: true };
}
```

## The annotator and agent evaluation
Calling `chat()` on an instance of `Chatbot` will return an `AgentEvaluationStream` that runs the following algorithm:
1. Create new `Dialog` with the previous context (if supplied).
2. Run each annotator in series.
3. If the stack is empty push the root agent.
4. Pop an agent from the stack and run it.
6. If the agent returns a message, emit it to the stream with the current context.
7. If the agent does not prompt repeat from step 3.
8. End the stream.

    Note it is possible to create loops where no agent prompts. To mitigate this the stream will error if it tries to evaluate over 100 agents or if the root agent was pushed more than 10 times.

```js
const evalStream = chatbot.chat('hello world', myOldContext);
evalStream.on('data', (data) => {
  console.log(data.message);
  console.log(data.context);
});
evalStream.on('error', (err) => {
  console.log('a bad thing happened:', err);
})
evalStream.on('end', () => {
  console.log('finished');
});
```

### Dialog Object
The dialog object is passed to both annotators and agents, exposes the context at `dialog.context` and several functions for agent evaluation.
```js
dialog.loopCount(); // returns the number of times the active agents has been
                    // called consecutively
dialog.pop();       // removes and returns the next agent from the Stack
dialog.push(agentLabel) // pushes a new agent onto the stack
```

The `pop()` function is also included if you want to remove agents from the
stack, but this is mainly used internally and would not be used in typical programs.

## Development
The package.json includes scripts for running istanbul coverage, eslint and mocha tests:
```sh
npm run lint
npm run test
npm run coverage
```

### ToDo
- [ ] Add examples
