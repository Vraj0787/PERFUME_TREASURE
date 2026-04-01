from flask import jsonify


def success_response(data=None, message=None, status_code=200):
    payload = {}
    if message:
        payload["message"] = message
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code


def error_response(message, status_code=400, errors=None):
    payload = {"message": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status_code
