functionName="${function:=LinebotHandlerNode}"
zip -r $functionName.zip index.js utils .env node_modules
aws lambda update-function-code --function-name $functionName --zip-file fileb://$functionName.zip