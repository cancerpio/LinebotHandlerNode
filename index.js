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
