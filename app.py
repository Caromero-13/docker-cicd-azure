from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/spin', methods=['POST'])
def spin():
    data = request.get_json() or {}
    participants = data.get('participants') or []
    if not participants:
        return jsonify({'error': 'No participants provided'}), 400
    idx = random.randrange(len(participants))
    winner = participants[idx]
    return jsonify({'index': idx, 'winner': winner})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
