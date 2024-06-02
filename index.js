const { produceMessage } = require('./utils/kafka/producer');
require('dotenv').config();

const nextPageHandler = async (event, context) => {
  const kafkaTopic = process.env.KAFKA_TOPIC;
  const { body } = event;
  const bodyContent = JSON.parse(body);
  const { events } = bodyContent;
  const produceKafkaResults = [];
  events.forEach((e) => {
    if (e.type === 'message' && e.message !== undefined && e.message.type === 'text') {
      const {
        source: {
          userId,
        },
        message: {
          text,
        },
        timestamp,
        replyToken,
      } = e;

      produceKafkaResults.push(produceMessage({
        topic: kafkaTopic,
        messages: [{
          key: userId,
          value: JSON.stringify({
            userId,
            text,
            timestamp,
            replyToken,
            date: new Date().toUTCString(),
          }),
        }],
      }));
    }
  });

  await Promise.all(produceKafkaResults);
  return context.logStreamName;
};

const handlerFactory = (name) => {
  const functionCode = {
    nextPage: nextPageHandler,
  };

  return functionCode[name];
};

exports.handler = async function (event, context) {
  const handler = handlerFactory('nextPage');
  await handler(event, context);
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
