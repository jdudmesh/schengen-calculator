import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
from cryptography.x509 import load_pem_x509_certificate
import datetime as dt

dynamodb = boto3.resource('dynamodb')
user_table = dynamodb.Table('SchengenCalculator')

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")

ALGORITHMS = [ "RS256" ]
CERTIFICATE_DATA = os.getenv("CERTIFICATE_DATA")

cert_obj = load_pem_x509_certificate(CERTIFICATE_DATA)
public_key = cert_obj.public_key()


class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def get_token_auth_header(auth):

    #Obtains the Access Token from the Authorization Header
    if not auth:
        raise AuthError({"code": "authorization_header_missing",
                        "description":
                            "Authorization header is expected"}, 401)

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError({
            "code": "invalid_header",
            "description": "Authorization header must start with Bearer"
        }, 401)

    elif len(parts) == 1:
        raise AuthError({
            "code": "invalid_header",
            "description": "Token not found"
        }, 401)

    elif len(parts) > 2:
        raise AuthError({
            "code": "invalid_header",
            "description": "Authorization header must be  Bearer token"
        }, 401)

    token = parts[1]
    return token

def validate_token(token):

    # cert_response = requests.get("https://"+AUTH0_DOMAIN+"/.well-known/jwks.json")
    # if cert_response.status_code != 200:
    #     raise AuthError({
    #         "code": "cannot_load_cert",
    #         "description": "Could not load certificate"
    #     }, 401)


    # jwks = json.loads(cert_response.text)
    # certificate_data = "-----BEGIN CERTIFICATE-----\n" + jwks["keys"][0]["x5c"][0] + "\n-----END CERTIFICATE-----"
    # algorithms = [ jwks["keys"][0]["alg"] ]

    try:

        payload = jwt.decode(
            token,
            public_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer="https://"+AUTH0_DOMAIN+"/"
        )

    except Exception as ex:

        raise AuthError({
            "code": "invalid_header",
            "description": "Unable to parse authentication token."
        }, 401)

    return payload["sub"]

def get_data(user_id):

    result = user_table.get_item(Key={"user_id": user_id})
    if "Item" in result:
        return json.loads(result["Item"]["user_data"])
    else:
        return []

def save_data(user_id, data):

    result = user_table.put_item(Item={
        "user_id": user_id,
        "user_data": json.dumps(data),
        "last_save_date": dt.datetime.now().isoformat()
    })


def build_response(status_code, message=None):

    response = {
        'statusCode': str(status_code),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization,Content-Type',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
        }
    }

    if message != None:
        response['body'] = json.dumps(message)

    return response

def lambda_handler(event, context):

    try:

        if event["httpMethod"] == "OPTIONS":
            return build_response(200)

        if not "Authorization" in event["headers"]:
            raise AuthError({
                "code": "invalid_request",
                "description": "missing Authorization header"
            }, 401)

        token = get_token_auth_header(event["headers"]["Authorization"])
        user_id = validate_token(token)

        if event["httpMethod"] == "GET":
            response_data = get_data(user_id)
            return build_response(200, response_data)

        elif event["httpMethod"] == "POST":
            request_data = json.loads(event["body"])
            response_data = save_data(user_id, request_data)
            return build_response(200)

        else:
            return build_response(400)

    except AuthError as ex:
        return build_response(ex.status_code, ex.error)




if __name__ == "__main__":

    test_event = {"resource": "/calendar", "path": "/calendar", "httpMethod": "GET", "headers": {
        "accept": "*/*",
        "Host": "7x4niz9wyh.execute-api.eu-west-1.amazonaws.com",
        "User-Agent": "curl/7.64.1",
        "X-Amzn-Trace-Id": "Root=1-600817b4-39e1e31925eccbf92ba3d59e",
        "X-Forwarded-For": "89.83.224.40",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https",
        "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InhVZkx4clNQbVYteFNRSE9UUkwxSiJ9.eyJpc3MiOiJodHRwczovL3Byb3BvbGlzLWRldi5ldS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDg4NjUyODA1OTM3MzUzMDU2NDAiLCJhdWQiOlsiaHR0cHM6Ly9hcGkudmlzYWZyZWVjYWxjdWxhdG9yLmV1LyIsImh0dHBzOi8vcHJvcG9saXMtZGV2LmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2MTExNTM4OTksImV4cCI6MTYxMTI0MDI5OSwiYXpwIjoiYTNvT3VJU2U3MVAzN0o2OUZ5WE1rdmxteDduSFQ5a1QiLCJzY29wZSI6Im9wZW5pZCJ9.egZBNm5Too6EjfziU6wt61SqwfLUYFiVzbok0Pk-mTmIKCPdzBtf3c6gxCOaW9X6A4pvy9rQZi1XVJIVllosrbcvWBulFwdT3Wudsq_E2vMNBuIEJltkGcgTvq171xCdeOdde3ZZwTWmhNEcE9EFk0pSBSQSCkuRhp8baeXIrCCn1dfKJe4GNtIgdQYPM6lf87GWr0XVAJxfJgXNdAf1bPSXTk8knghrje25MVe_zaC291XajZq7Jgdpfq_UAbq-Q_siiOagtTmd087dWQzmBOhWLPhRs5FTUy6iAd0W3H--duXlTKdo-Z_dXOSN44Ldxk8kKv8L2807PP6KS_I-Yg"
    }, "multiValueHeaders": {"accept": ["*/*"], "Host": ["7x4niz9wyh.execute-api.eu-west-1.amazonaws.com"], "User-Agent": ["curl/7.64.1"], "X-Amzn-Trace-Id": ["Root=1-600817b4-39e1e31925eccbf92ba3d59e"], "X-Forwarded-For": ["89.83.224.40"], "X-Forwarded-Port": ["443"], "X-Forwarded-Proto": ["https"]}, "queryStringParameters": "", "multiValueQueryStringParameters": "", "pathParameters": "", "stageVariables": "", "requestContext": {"resourceId": "thfikj", "resourcePath": "/calendar", "operationName": "getCalendar", "httpMethod": "GET", "extendedRequestId": "ZcikOG9VDoEFiBA=", "requestTime": "20/Jan/2021:11:44:52 +0000", "path": "/v1/calendar", "accountId": "175634118767", "protocol": "HTTP/1.1", "stage": "v1", "domainPrefix": "7x4niz9wyh", "requestTimeEpoch": 1611143092505, "requestId": "d53766e2-2322-4237-9e6f-d10ba72e1fe2", "identity": {"cognitoIdentityPoolId": "", "accountId": "", "cognitoIdentityId": "", "caller": "", "sourceIp": "89.83.224.40", "principalOrgId": "", "accessKey": "", "cognitoAuthenticationType": "", "cognitoAuthenticationProvider": "", "userArn": "", "userAgent": "curl/7.64.1", "user": ""}, "domainName": "7x4niz9wyh.execute-api.eu-west-1.amazonaws.com", "apiId": "7x4niz9wyh"}, "body": None, "isBase64Encoded": False}

    response = lambda_handler(test_event, None)
    print(json.dumps(response))