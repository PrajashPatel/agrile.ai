# Arile.AI

Arile.AI is an AI-powered plant image analyzer. It uses Google Gemini API to analyze plant images and provide descriptions, including visible disease signs or health conditions.

## Features

- Analyze plant images using AI.
- Get detailed descriptions of plant health and visible diseases.
- Easy command-line usage.

## How It Works

You provide an image of a plant, and the script sends it to the Gemini API. The API returns a description of the plant, mentioning any visible disease signs or health conditions.

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/PrajashPatel/agrile.ai.git
   cd agrile.ai
   ```

2. **Create a virtual environment (optional but recommended):**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
   *(Create `requirements.txt` with `requests` and any other dependencies if not present.)*

4. **Set up environment variables:**
   - Copy `.env.example` to `.env`.
   - Add your actual Gemini API key to `.env`:
     ```
     GEMINI_API_KEY=your_real_gemini_api_key
     ```

## Usage

Run the following command to analyze a plant image:

```sh
python client/caption.py <path_to_image>
```

- Replace `<path_to_image>` with the path to your plant image file (JPEG format recommended).
- The script will print a description of the plant, including any visible diseases or health conditions.

## Environment Variables

The script requires the following environment variable:

- `GEMINI_API_KEY` — Your Google Gemini API key.

See `.env.example` for the format.

## Example

```sh
python client/caption.py sample_plant.jpg
```

**Output:**
```
This plant appears healthy, with no visible signs of disease.
```
*(Output will vary based on the image and API response.)*

## Security

- **Never commit your real `.env` file or API keys to version control.**
- `.env` is included in `.gitignore` to keep your secrets safe.

## License

MIT

## Contact

For questions or support, open an issue or contact [@PrajashPatel](https://github.com/PrajashPatel) or email: your-email@example.com


