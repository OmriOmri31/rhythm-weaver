# Mix Download Server

שרת Python להורדת שירים מיוטיוב וספוטיפיי.

## התקנה

```bash
cd server
pip install -r requirements.txt
```

## דרישות נוספות

ודא ש-**ffmpeg** מותקן במחשב:

**Windows:**
```bash
winget install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## הפעלה

```bash
python app.py
```

השרת ירוץ ב-`http://localhost:5000`

## שימוש

השרת חושף את ה-endpoints הבאים:

- `GET /health` - בדיקת תקינות
- `POST /download` - הורדת שיר
  ```json
  { "query": "שם שיר או קישור ליוטיוב/ספוטיפיי" }
  ```
- `GET /file/<file_id>` - קבלת קובץ שהורד
- `DELETE /cleanup/<file_id>` - מחיקת קובץ

## חשיפה לאינטרנט (לשימוש עם Lovable)

כדי שהאפליקציה תוכל לגשת לשרת, תצטרך לחשוף אותו לאינטרנט:

**אפשרות 1: ngrok (הכי קל)**
```bash
ngrok http 5000
```
תקבל URL כמו `https://abc123.ngrok.io`

**אפשרות 2: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:5000
```

העתק את ה-URL שתקבל והזן אותו באפליקציה.
