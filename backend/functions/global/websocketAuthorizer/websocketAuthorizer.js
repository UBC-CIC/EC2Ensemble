const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch');


const region = process.env.region;
const userPoolId = process.env.userPoolId;
const aud = process.env.aud;
// https://aws.amazon.com/premiumsupport/knowledge-center/decode-verify-cognito-json-token/
// Amazon Cognito generates two RSA key pairs for each user pool. 
// The private key of each pair is used to sign the respective ID token or access token.
const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

exports.handler = async (event, context) => {
	const methodArn = event.methodArn;
	const token = event.queryStringParameters.Authorization;

	if (!token) {
        return context.fail('Unauthorized');
    } else {
        // 1. decode the id token
        // https://github.com/aws-samples/simple-websockets-chat-app/issues/22
		const decodedJwt = jwt.decode(token, { complete: true })
		if (!decodedJwt) {
			console.log('Not a valid JWT token')
			context.fail('Unauthorized')
			return
		}
        // verify claims
        // (aud) should match the app client ID that was created in the Amazon Cognito user pool.
        if (decodedJwt.payload.aud !== aud) {
            console.log('invalid app client ID')
            context.fail('Unauthorized')
            return
        }
        //Fail if token is not from your UserPool
        if (decodedJwt.payload.iss !== iss) {
            console.log('invalid issuer')
            context.fail('Unauthorized')
            return
        }
        //Reject the jwt if it's not an 'ID Token'
        if (decodedJwt.payload.token_use !== 'id') {
            console.log('Not an id token')
            context.fail('Unauthorized')
            return
        }

        // get local key id
        const kid = decodedJwt.header.kid;

		// Fetch known valid keys
        await fetch(iss+'/.well-known/jwks.json')
			.then(res => res.json())
			.then(publicKeys => {
				// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-1
				// 2. compare local keyid to public kid
                const jwkeys = publicKeys.keys;
            	const jwk = jwkeys.find((key) => key.kid === kid);

                if (jwk) {
                    return Promise.resolve(jwkToPem(jwk));
                } else {
                    return Promise.reject(new Error('Fail to find public key'))
                }
			})
            .then(pem => {
                // 3. Use the public key to verify the signature using your JWT library.
                jwt.verify(token, pem, { issuer: iss, algorithms: ['RS256'] }, function(err, decodedToken) {
                    if (err) {
                        callback(null, generateDeny(decodedToken.sub, methodArn));
				        context.fail('Unable to verify signature');
                      } else {
                        console.log('Success')
                        context.succeed(generateAllow(decodedToken.sub, methodArn));
                      }
                });
            })
			.catch(err => {
				console.error('Unable to verify token', err);
				context.fail('Unable to verify authentication');
			})
	}
}

// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
var generateAllow = function(principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
}

var generateDeny = function(principalId, resource) {
    return generatePolicy(principalId, 'Deny', resource);
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