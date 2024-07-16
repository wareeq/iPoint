from flask import Flask, request, jsonify
import urllib.parse
import subprocess

app = Flask(__name__)

@app.route('/run-script', methods=['POST'])
def run_script():
    request_data = request.get_json()
    
    # Extract details from the request data
    method = request_data['method']
    full_url = request_data['url']
    headers = request_data['headers']
    raw_request_body = request_data['rawRequest']
    
    # Parse the URL to get the path and host
    parsed_url = urllib.parse.urlparse(full_url)
    path = parsed_url.path
    if parsed_url.query:
        path += '?' + parsed_url.query
    host = parsed_url.netloc
    
    # Construct the raw HTTP request format
    http_request = f"{method} {path} HTTP/1.1\n"
    http_request += f"Host: {host}\n"
    http_request += headers.replace('\n', '\n')  # Ensure each header is on a new line
    http_request += "\n\n"
    http_request += raw_request_body
    
    # Save to test.txt
    with open('test.txt', 'w') as file:
        file.write(http_request)
    
    # Run the external script using test.txt
    result = subprocess.run(['python3', '~/pentester/tools/scripts/BlackBox/blackBox.py', '-f' , 'test.txt'], capture_output=True, text=True)
    
    # Dummy response to indicate success and return script output
    return jsonify({"status": "success", "message": "Request saved and script executed", "script_output": result.stdout}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
