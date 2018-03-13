'use strict';

const Supervisor = require('./src/Chatbot');

let annotators = [
  async function classifier(dialog) {
    let { context } = dialog;
    context.intents = [];

    if (context.input.includes('hello'))
      context.intents.push('greeting');
    else if (context.input.includes('goodbye'))
      context.intents.push('farewell');
    else if (context.input.includes('quiz me'))
      context.intents.push('quiz');

    return dialog;
  }
];

let agents = {
  'root': async function root(dialog) {
    let nextAgent;
    switch(dialog.context.intents[0]) {
      case 'greeting':
        nextAgent = 'greetingAgent';
        break;
      case 'farewell':
        nextAgent = 'farewellAgent';
        break;
      case 'quiz':
        nextAgent = 'quiz';
        break;
    }
    dialog.push(nextAgent);
    return { prompt: false };
  },
  'greetingAgent':async function greetingAgent() {
    return { prompt: true, message: 'hello'};
  },
  'farewellAgent': async () => {
    return { prompt: true, message: 'goodbye'};
  },
  'quiz': async dialog => {
    dialog.push('quiz-questionOne');
    return { prompt: false, message: 'Ok lets do a quiz' };
  },
  'quiz-questionOne': async dialog => {
    switch(dialog.loop()) {
      case 0:
        return {
          prompt: true,
          message: 'when is the next ferry to belfast?'
        };
      case 1:
      case 2:
      case 3:
        if (dialog.input.contains('port')) {
          dialog.setConcept('toPort', dialog.input['port']);
          return { done: true };
        } else {
          return {
            prompt: true,
            message: 'I\'m sorry i didn\'t understand that. When is the next ferry to belfast?'
          };
        }
      default:
        dialog.clearStack();
        return { prompt: true };
    }
  },
  'quiz-questionOne-answer': async dialog => {
    if (!dialog.input.entities.contains('now')) {
      dialog.push('quiz-questionOne');
      return { prompt: false, message: 'Sorry I didn\'t get that'};
    }

    return { prompt: true };
  }
};

let chatbot = new Supervisor(annotators, agents);


let stream = chatbot.chat('hello');
stream.on('data', ({message}) => console.log(message));
stream.on('error', console.error);
stream.on('end', () => console.log('end'));
