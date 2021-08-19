const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const region = process.env.centralRegion;
// https://aws.amazon.com/premiumsupport/knowledge-center/decode-verify-cognito-json-token/
// Amazon Cognito generates two RSA key pairs for each user pool. 
// The private key of each pair is used to sign the respective ID token or access token.
// const url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
const url = `https://cognito-idp.${region}.amazonaws.com/ca-central-1_20ArNefjM/.well-known/jwks.json`;

exports.handler = async (event, context) => {
	const methodArn = event.methodArn;
	const token = event.queryStringParameters.Authorization;

	console.log('Websocket auth invoked! event =', event, 'context =', context, 'token = ', token)

	if (!token) {
        return context.fail('Unauthorized');
    } else {
		const decodedJwt = jwt.decode(token, { complete: true })
		console.log(decodedJwt)

		if (!decodedJwt) {
			console.log('Not a valid JWT token')
			context.fail('Unauthorized')
			return
		}

        const kid = decodedJwt.header.kid;

		// Fetch known valid keys
        await fetch(url)
			.then(res => res.json())
			.then(data => {
				// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-1
				const keys = data['keys'];
            	const foundKey = keys.find((key) => key.kid === kid);

				console.log("fetched", keys, foundKey)
				// context.succeed(generateAllow('me', methodArn)); // context.authorizer.principalId 
			})
			.catch(err => {
				console.error('Unable to verify token', err);
				// callback(null, generatePolicy('user', 'Deny', event.methodArn));
				context.fail('Signature verification failed');
			})
	}
}

// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
var generateAllow = function(principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
}

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
    let authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    return authResponse;
}