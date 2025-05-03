import sys
import requests
import base64
import os
print("Arguments:", sys.argv)


try:
    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    # Read image and encode as base64
    with open(image_path, "rb") as image_file:
        image_data = base64.b64encode(image_file.read()).decode("utf-8")

    headers = {
        "Authorization": "Bearer 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"
    }

    API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base"

    response = requests.post(API_URL, headers=headers, json={"inputs": image_data})

    if response.status_code == 200:
        result = response.json()
        print(result[0]["generated_text"])
    else:
        print("Error: ", response.status_code, response.text)

except Exception as e:
    print("Python error:", str(e), file=sys.stderr)
