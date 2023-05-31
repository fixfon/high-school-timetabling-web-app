import json

def lambda_handler(event, context):
    # Retrieve the JSON body from the POST request
    try:
        body = json.loads(event['body'])
    except KeyError:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid request body'})
        }

    # Process the JSON data as needed
    # You can access specific values using body['key_name']

    # Return a response

    response = {
        'statusCode': 200,
        'body': json.dumps(body)
    }
    return response