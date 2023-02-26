// eslint-disable-next-line import/prefer-default-export
export const handler = async (event) => {
  // TODO implement
  console.log(`GOT event: \n${event}`);
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
