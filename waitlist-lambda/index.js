const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');
const {v4 : uuidv4} = require('uuid')

/**
 * @type {import('http').Server}
 */
const server = awsServerlessExpress.createServer(app);

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
  try {
    console.log(`EVENT Waitlist: ${JSON.stringify(event)}`);

    const id = uuidv4();

    const body = {...JSON.parse(event.body), id, created_at: new Date().toISOString()}

    // Regenerate the previous request
    const requestData = {
      body: JSON.stringify(body),
      headers: event.headers,
      httpMethod: event.httpMethod,
      isBase64Encoded: event.isBase64Encoded,
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      requestContext: event.requestContext,
      resource: event.resource,
      stageVariables: event.stageVariables
    };

    return await awsServerlessExpress.proxy(server, requestData, context, 'PROMISE').promise;
  } catch (error) {
    console.error('ERROR Waitlist: ', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message })
    };
  }
};

