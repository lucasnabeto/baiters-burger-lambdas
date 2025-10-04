const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_APP_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
};

exports.handler = async (event) => {
    console.log(
        "Evento do Authorizer recebido:",
        JSON.stringify(event, null, 2)
    );

    const token = event.authorizationToken;
    if (!token) {
        console.log("Token de autorização ausente.");
        // O API Gateway converte isso em um 401 Unauthorized
        return generatePolicy("user", "Deny", event.methodArn);
    }

    const jwt = token.split(" ")[1];
    if (!jwt) {
        console.log("Token mal formatado. 'Bearer ' não encontrado.");
        return generatePolicy("user", "Deny", event.methodArn);
    }

    try {
        const payload = await verifier.verify(jwt);
        console.log("Token é válido. Payload:", payload);

        return generatePolicy(
            payload.sub || payload.client_id,
            "Allow",
            event.methodArn
        );
    } catch (err) {
        console.error("Token inválido:", err);
        return generatePolicy("user", "Deny", event.methodArn);
    }
};
