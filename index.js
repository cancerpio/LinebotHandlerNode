const { produceMessage } = require('./utils/kafka/producer');
require('dotenv').config();

/**
 * Handles the kafka event.
 *
 * @param {Object} event - The event object.
 * @param {Object} context - The context object.
 * @returns {string} - The log stream name.
 */
const kafkaHandler = async (event, context) => {
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

const linePlatformHandler = async (event, context) => {
  // eslint-disable-next-line
  const line = require('@line/bot-sdk');
  const { body } = event;
  const bodyContent = JSON.parse(body);
  const { events } = bodyContent;

  // create LINE SDK client
  const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  });

  await Promise.all(events.map(async (e) => {
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
      const date = new Date(timestamp * 1000);
      const formatDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDay}/${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      // create a echoing text message
      const echo = { type: 'text', text: `${userId} say: ${text} at ${formatDate}` };
      // use reply API
      await client.replyMessage({
        replyToken,
        messages: [echo],
      });
    }
  }));

  return context.logStreamName;
};
const handlerFactory = (name) => {
  const functionCode = {
    kafka: kafkaHandler,
    linePlatform: linePlatformHandler,
  };

  return functionCode[name];
};

exports.handler = async function (event, context) {
  const handler = handlerFactory('kafka');
  await handler(event, context);
};
