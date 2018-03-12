# dialog-framework

A framework for building asynchronous chatbot conversations.

## Basic Usage

```javascript
const DialogFramework = require('dialog-framework');
let  = new DialogFramework();
df.register();


let stream = df.chat('hello world', context);
stream.on('data', (response) => {
  let { message, context } = response;
  console.log(message);
});
stream.on('end');
```
