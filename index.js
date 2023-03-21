const { produceMessage } = require('./utils/kafka/producer');

produceMessage({
  topic: 'TEST_INITIALIZE_TOPIC',
  messages: [{ key: 'Date', value: new Date().toUTCString() }],
});

exports.handler = async function (event, context) {
  const { body } = event;
  const bodyContent = JSON.parse(body);
  const { events } = bodyContent;
  events.forEach((e) => {
    console.log(e);
  });

  return context.logStreamName;
};

// exports.handler = async function (event, context) {
// // create LINE SDK config from env variables
//   const config = {
//     channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
//     channelSecret: process.env.CHANNEL_SECRET,
//   };

//   // create LINE SDK client
//   const client = new line.Client(config);
//   const app = new Koa();

//   // event handler
//   function handleEvent(event) {
//     if (event.type !== 'message' || event.message.type !== 'text') {
//     // ignore non-text-message event
//       return Promise.resolve(null);
//     }

//     // create a echoing text message
//     const echo = { type: 'text', text: event.message.text };

//     // use reply API
//     return client.replyMessage(event.replyToken, echo);
//   }

//   // register a webhook handler with middleware
//   // about the middleware, please refer to doc
//   app.post('/callback', line.middleware(), (req, res) => {
//     Promise
//       .all(req.body.events.map(handleEvent))
//       .then((result) => res.json(result))
//       .catch((err) => {
//         console.error(`Error : ${err}`);
//         res.status(500).end();
//       });
//   });

//   // listen on port
//   const port = process.env.PORT || 3000;
//   app.listen(port, () => {
//     console.log(`listening on ${port}`);
//   });
// };
