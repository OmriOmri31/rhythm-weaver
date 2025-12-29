"""
Flask server for downloading audio from YouTube/Spotify
Run with: python app.py
Make sure to install: pip install flask flask-cors yt-dlp requests beautifulsoup4
"""

import os
import sys
import uuid
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from bs4 import BeautifulSoup
import yt_dlp

app = Flask(__name__)
CORS(app)  # Allow requests from your Lovable app

# Directory to store downloaded files
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), 'downloads')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def get_spotify_track_name(spotify_url):
    """Extract track name from Spotify URL"""
    try:
        response = requests.get(spotify_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.text
                if ' - song and lyrics by ' in title:
                    return title.split(' - song and lyrics by ')[0].strip()
                elif ' | Spotify' in title:
                    return title.replace(' | Spotify', '').strip()
        return None
    except Exception as e:
        print(f"Error fetching Spotify track name: {e}")
        return None


def download_audio(user_input, output_id):
    """Download audio and return the file path"""
    output_path = os.path.join(DOWNLOAD_DIR, output_id)
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '0',
        }],
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
    }
    
    # Check if it's a Spotify URL
    if 'open.spotify.com' in user_input:
        track_name = get_spotify_track_name(user_input)
        if track_name:
            user_input = f"ytsearch1:{track_name}"
        else:
            return None, "Could not extract track name from Spotify URL"
    
    # Check if it's a search query (not a URL)
    elif not user_input.startswith('http'):
        user_input = f"ytsearch1:{user_input}"
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(user_input, download=True)
            if 'entries' in info:
                info = info['entries'][0]
            
            title = info.get('title', 'Unknown')
            wav_path = output_path + '.wav'
            
            if os.path.exists(wav_path):
                return wav_path, title
            else:
                return None, "Download failed"
    except Exception as e:
        return None, str(e)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


@app.route('/download', methods=['POST'])
def download_endpoint():
    """
    Download audio from YouTube/Spotify
    Body: { "query": "song name or URL" }
    Returns: { "success": true, "file_id": "...", "title": "..." }
    """
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({'success': False, 'error': 'No query provided'}), 400
    
    file_id = str(uuid.uuid4())
    file_path, result = download_audio(query, file_id)
    
    if file_path:
        return jsonify({
            'success': True,
            'file_id': file_id,
            'title': result
        })
    else:
        return jsonify({'success': False, 'error': result}), 500


@app.route('/file/<file_id>', methods=['GET'])
def get_file(file_id):
    """Serve a downloaded audio file"""
    file_path = os.path.join(DOWNLOAD_DIR, f"{file_id}.wav")
    
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='audio/wav')
    else:
        return jsonify({'error': 'File not found'}), 404


@app.route('/cleanup/<file_id>', methods=['DELETE'])
def cleanup_file(file_id):
    """Delete a downloaded file"""
    file_path = os.path.join(DOWNLOAD_DIR, f"{file_id}.wav")
    
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'File not found'}), 404


if __name__ == '__main__':
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    print("=" * 50)
    print("Mix Download Server")
    print("=" * 50)
    print(f"Download directory: {DOWNLOAD_DIR}")
    print(f"Server running on port: {port}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=False)
