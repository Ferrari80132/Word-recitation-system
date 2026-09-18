#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单词背诵系统 - 本地文件存储服务器
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 数据存储目录
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATA_FILE = os.path.join(DATA_DIR, 'user_data.json')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

def get_default_data():
    """返回默认数据结构"""
    return {
        'currentBook': 'cet6',
        'wordsPerGroup': 10,
        'masteredWords': [],
        'reviewWords': [],
        'checkinDates': [],
        'dailyStats': {},
        'theme': 'dark'
    }

@app.route('/')
def index():
    """返回主页"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """返回静态文件"""
    return send_from_directory('.', path)

@app.route('/api/data', methods=['GET'])
def get_data():
    """获取用户数据"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = get_default_data()
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data', methods=['POST'])
def save_data():
    """保存用户数据"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '无效的数据'}), 400

        # 保存数据到文件
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': '数据保存成功'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/backup', methods=['GET'])
def backup_data():
    """备份数据"""
    try:
        if not os.path.exists(DATA_FILE):
            return jsonify({'success': False, 'error': '没有数据可备份'}), 404

        # 创建备份文件
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(DATA_DIR, f'backup_{timestamp}.json')

        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)

        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': f'备份成功: {backup_file}'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print('单词背诵系统服务器启动中...')
    print(f'数据存储目录: {DATA_DIR}')
    print(f'访问地址: http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
