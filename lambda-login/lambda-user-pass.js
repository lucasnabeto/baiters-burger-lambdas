const {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_APP_CLIENT_SECRET;

const cognitoClient = new CognitoIdentityProviderClient({});

function getSecretHash(username) {
    const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
    hmac.update(username + CLIENT_ID);
    return hmac.digest("base64");
}

exports.handler = async (event, context) => {
    try {
        let body;

        if (event.body) {
            body = JSON.parse(event.body);
        } else if (event.username && event.password) {
            body = event;
        } else {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Corpo da requisição inválido.",
                }),
            };
        }

        const { username, password } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message:
                        "Dados de login ausentes. Certifique-se de que o corpo da requisição contenha username e password.",
                }),
            };
        }

        // Calcula o SECRET_HASH
        const secretHash = getSecretHash(username);

        const command = new AdminInitiateAuthCommand({
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
                SECRET_HASH: secretHash,
            },
        });

        const response = await cognitoClient.send(command);

        if (response.AuthenticationResult) {
            const { IdToken, AccessToken, RefreshToken } =
                response.AuthenticationResult;

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_token: IdToken,
                    access_token: AccessToken,
                    refresh_token: RefreshToken,
                }),
            };
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
            };
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);

        if (error.name === "NotAuthorizedException") {
            return {
                statusCode: 401,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Credenciais inválidas." }),
            };
        } else {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Ocorreu um erro inesperado: ${error.message}`,
                }),
            };
        }
    }
};
