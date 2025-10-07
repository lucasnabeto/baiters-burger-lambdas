# Baiters Burger - Lambdas de Autenticação - apresentação

Este repositório contém as funções Lambda AWS responsáveis pelo sistema de autenticação do Baiters Burger, utilizando AWS Cognito como provedor de identidade.

## Visão Geral

O projeto consiste em duas funções Lambda principais:

1. **Lambda Authorizer** - Valida tokens JWT para autorização de APIs
2. **Lambda Login** - Autentica usuários e retorna tokens de acesso

## Estrutura do Projeto

```
baiters-burger-lambdas/
├── README.md
├── lambda-authorizer/           # Função de autorização
│   ├── lambda-authorizer.js     # Código principal do authorizer
│   └── package.json             # Dependências
└── lambda-login/                # Função de login
    ├── lambda-user-pass.js      # Código principal do login
    └── package.json             # Dependências
```

## Lambda Authorizer

### Funcionalidade
Valida tokens JWT do AWS Cognito e gera políticas IAM para permitir ou negar acesso às APIs.

### Características
- Suporte a múltiplos client IDs (login e machine-to-machine)
- Validação de tokens Bearer
- Geração automática de políticas IAM
- Logs detalhados para debugging

### Variáveis de Ambiente Necessárias
- `COGNITO_USER_POOL_ID` - ID do User Pool do Cognito
- `COGNITO_APP_CLIENT_ID_LOGIN` - Client ID para autenticação de usuários
- `COGNITO_APP_CLIENT_ID_MACHINE` - Client ID para autenticação machine-to-machine

### Dependências
- `aws-jwt-verify` (^5.1.1) - Biblioteca para verificação de tokens JWT do Cognito

### Formato de Entrada
```json
{
  "authorizationToken": "Bearer <jwt-token>",
  "methodArn": "arn:aws:execute-api:region:account:api-id/stage/method/resource"
}
```

### Formato de Saída
```json
{
  "principalId": "user-id",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Allow|Deny",
        "Resource": "arn:aws:execute-api:..."
      }
    ]
  }
}
```

## Lambda Login

### Funcionalidade
Autentica usuários usando credenciais (username/password) no AWS Cognito e retorna tokens de acesso.

### Características
- Autenticação via ADMIN_USER_PASSWORD_AUTH flow
- Suporte a SECRET_HASH para segurança adicional
- Tratamento de erros específicos (credenciais inválidas, etc.)
- Compatibilidade com diferentes formatos de entrada

### Variáveis de Ambiente Necessárias
- `COGNITO_USER_POOL_ID` - ID do User Pool do Cognito
- `COGNITO_APP_CLIENT_ID` - Client ID da aplicação
- `COGNITO_APP_CLIENT_SECRET` - Client Secret da aplicação

### Dependências
- `@aws-sdk/client-cognito-identity-provider` (^3.901.0) - SDK AWS para Cognito

### Formato de Entrada
```json
{
  "body": "{\"username\": \"user@example.com\", \"password\": \"password123\"}"
}
```

ou diretamente:
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

### Formato de Saída (Sucesso)
```json
{
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "body": "{\"id_token\": \"...\", \"access_token\": \"...\", \"refresh_token\": \"...\"}"
}
```

### Códigos de Erro
- `400` - Dados de entrada inválidos
- `401` - Credenciais inválidas
- `500` - Erro interno do servidor

## Deploy

### Pré-requisitos
- AWS CLI configurada
- Node.js instalado
- Acesso ao AWS Cognito configurado

### Instalação das Dependências

Para o Lambda Authorizer:
```bash
cd lambda-authorizer
npm install
```

Para o Lambda Login:
```bash
cd lambda-login
npm install
```

### Configuração das Variáveis de Ambiente
Certifique-se de configurar todas as variáveis de ambiente necessárias no console AWS Lambda ou através do AWS CLI/CloudFormation.

## Desenvolvimento Local

### Testando o Lambda Authorizer
```javascript
// Exemplo de evento de teste
const event = {
  authorizationToken: "Bearer <seu-jwt-token>",
  methodArn: "arn:aws:execute-api:us-east-1:123456789012:abcdef123/test/GET/request"
};
```

### Testando o Lambda Login
```javascript
// Exemplo de evento de teste
const event = {
  body: JSON.stringify({
    username: "usuario@exemplo.com",
    password: "senha123"
  })
};
```

## Logs e Monitoramento

Ambas as funções utilizam `console.log` e `console.error` para logging, que são automaticamente capturados pelo CloudWatch Logs da AWS.

### Logs Importantes
- **Authorizer**: Eventos de autorização, tokens inválidos, erros de verificação
- **Login**: Tentativas de autenticação, erros de credenciais, respostas do Cognito

## Segurança

- Tokens JWT são validados contra o User Pool do Cognito
- SECRET_HASH é utilizado para adicionar camada extra de segurança
- Logs não expõem informações sensíveis como senhas ou tokens completos
- Políticas IAM são geradas dinamicamente baseadas na validação

## Recursos Adicionais

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS JWT Verify Library](https://github.com/awslabs/aws-jwt-verify)


## Licença

Este projeto é propriedade do Baiters Burger e destinado apenas para uso interno.
