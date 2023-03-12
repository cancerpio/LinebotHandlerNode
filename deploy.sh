zip LinebotHandlerNode.zip index.js .env node_modules
aws lambda update-function-code --function-name LinebotHandlerNode --zip-file fileb://LinebotHandlerNode.zip