import sys
import base64
import os
import requests
import json

print("Arguments:", sys.argv)

try:
    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    # Read and encode image
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    # Gemini API key
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Or replace with hardcoded key (not recommended)
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Describe this plant image. Mention any visible disease signs or health condition."},
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_data
                        }
                    }
                ]
            }
        ]
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        print(text)
    else:
        print("Error:", response.status_code, response.text)

except Exception as e:
    print("Python error:", str(e), file=sys.stderr)
