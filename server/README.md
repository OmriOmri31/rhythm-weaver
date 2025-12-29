# Mix Download Server

Flask server for downloading audio from YouTube and Spotify using yt-dlp.

## Local Testing

1. Install ffmpeg:
   - **Mac**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **Windows**: `winget install ffmpeg`

2. Install Python dependencies:
   ```bash
   cd server
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python app.py
   ```

The server will run on http://localhost:5000

---

## Deploy to Render.com

### Using Docker (Recommended)

1. Go to https://render.com and create an account
2. Click "New" → "Web Service"
3. Connect your GitHub repo (or use "Public Git repository")
4. Set the following:
   - **Name**: `notellamix-server`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
   - **Instance Type**: Free (or Starter for better performance)

5. Click "Create Web Service"
6. Wait for the build to complete
7. Copy your Render URL (e.g., `https://notellamix-server.onrender.com`)

---

## After Deploying

1. Copy your Render URL (e.g., `https://notellamix-server.onrender.com`)
2. In Lovable, go to Settings → Secrets
3. Add a secret: `VITE_BACKEND_URL` = your Render URL (without trailing slash)
4. The app will connect to your deployed server!

---

## API Endpoints

### GET /health
Health check endpoint

### POST /download
Download audio from YouTube or Spotify
```json
{
  "query": "song name or YouTube/Spotify URL"
}
```
Response:
```json
{
  "success": true,
  "file_id": "uuid",
  "title": "Song Title"
}
```

### GET /file/<file_id>
Get the downloaded WAV file

### DELETE /cleanup/<file_id>
Delete a downloaded file
