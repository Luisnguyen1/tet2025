from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)

SPOTIFY_CLIENT_ID = 'd98c4f7df3af4c71ac6a2ab7202fa655'
SPOTIFY_CLIENT_SECRET = '36d5a5bb8e9f40efbf190980d4cf2b59'

def get_spotify_token():
    auth_url = 'https://accounts.spotify.com/api/token'
    auth_response = requests.post(auth_url, {
        'grant_type': 'client_credentials',
        'client_id': SPOTIFY_CLIENT_ID,
        'client_secret': SPOTIFY_CLIENT_SECRET,
    }, headers={
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    
    if auth_response.status_code != 200:
        print('Error getting token:', auth_response.json())
        return None
        
    return auth_response.json()['access_token']

# Load ritual data
def load_ritual_data():
    with open('static/data/rituals.json', 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    ritual_types = {
        'grave_ritual': 'Cúng lễ tạ mộ cuối năm',
        'kitchen_god': 'Cúng ông Công ông Táo',
        'leaving_home': 'Cúng khi không ăn Tết tại nhà',
        'new_year_eve': 'Cúng giao thừa',
        'new_year_days': 'Cúng mùng 1, 2, 3 Tết',
        'end_new_year': 'Cúng mãn Tết',
        'first_full_moon': 'Cúng Rằm tháng Giêng',
        'first_work_day': 'Cúng khai xuân đầu năm'
    }
    return render_template('index.html', ritual_types=ritual_types)

@app.route('/get-ritual', methods=['POST'])
def get_ritual():
    ritual_type = request.form.get('ritual_type')
    name = request.form.get('name')
    birthdate = request.form.get('birthdate')
    address = request.form.get('address')
    deceased_name = request.form.get('deceased_name', '')
    
    rituals = load_ritual_data()
    selected_ritual = rituals.get(ritual_type)
    
    if selected_ritual:
        selected_ritual['content'] = selected_ritual['content'].format(
            name=name,
            address=address,
            deceased_name=deceased_name,
            business_type=request.form.get('business_type', 'cơ quan/cửa hàng'),
            business_name=request.form.get('business_name', ''),
            lunar_day=request.form.get('lunar_day', 'mùng một')
        )
    
    return jsonify(selected_ritual)

@app.route('/music')
def music():
    # Sử dụng playlist thay vì danh sách các bài riêng lẻ
    playlist = {
        'url': 'https://soundcloud.com/playlist-maker1/sets/nhac-tet',
        'title': 'Nhạc Tết 2024',
        'description': 'Tuyển tập nhạc Xuân hay nhất'
    }
    return render_template('music.html', playlist=playlist)

@app.route('/donate')
def donate():
    # Thông tin tài khoản nhận cúng dường
    payment_info = {
        'bank_accounts': [
            {
                'bank': 'VPBank',
                'account': '19116112003',
                'name': 'NGUYEN VAN MANH',
                'qr_code': 'vpbank_qr.png',
                'logo': 'https://finance.vietstock.vn/image/VPB'
            },
            {
                'bank': 'MoMo',
                'account': '03972737834',
                'name': 'NGUYEN VAN MANH',
                'qr_code': 'momo_qr.png',
                'logo': 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
            }
        ],
        'purposes': [
            'Cúng dường tam bảo',
            'Cúng dường trùng tu chùa',
            'Cúng dường từ thiện',
            'Cúng dường khác'
        ]
    }
    return render_template('donate.html', payment_info=payment_info)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, debug=True) 