const {
  Kafka, logLevel, CompressionTypes, Partitioners,
} = require('kafkajs');
require('dotenv').config();

const host = process.env.KAFKA_HOST_IP || 'localhost';
const port = process.env.KAFKA_PORT || 9092;
const clientId = process.env.KAFKA_CLIENT_ID || 'example-producer';

const kafka = new Kafka({
  logLevel: logLevel.DEBUG,
  brokers: [`${host}:${port}`],
  clientId,
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.LegacyPartitioner,
});

const produceMessage = async ({ topic = 'NON-GIVEN-MESSAGE', messages = [] } = {}) => {
  try {
    await producer.connect();

    await producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages,
    });
  } catch (e) {
    console.error(`[example/producer] ${e.message}`, e);
  } finally {
    await producer.disconnect();
  }
};

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.forEach((type) => {
  process.on(type, async (err) => {
    try {
      console.log(`process.on ${type}`);
      console.log(err);
      await producer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await producer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});

module.exports = {
  produceMessage,
};
