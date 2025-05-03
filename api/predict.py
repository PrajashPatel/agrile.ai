from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load the trained model
model = joblib.load('model.pkl')

# Define route for prediction
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    
    # Extract features from the input data
    try:
        pH_Value = float(data['pH_Value'])
        Rainfall = float(data['Rainfall'])
        Temperature = float(data['Temperature'])
        Humidity = float(data['Humidity'])
    except KeyError as e:
        return jsonify({'error': f'Missing parameter: {str(e)}'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid value format, please ensure all values are numbers.'}), 400

    # Check if the values are within valid ranges
    if not (0 < pH_Value < 14):
        return jsonify({'error': 'pH value must be between 0 and 14.'}), 400
    if not (0 <= Rainfall <= 5000):  # Example range for rainfall (you can adjust)
        return jsonify({'error': 'Rainfall must be between 0 and 5000 mm.'}), 400
    if not (-50 <= Temperature <= 60):  # Example range for temperature (adjust as needed)
        return jsonify({'error': 'Temperature must be between -50 and 60 degrees Celsius.'}), 400
    if not (0 <= Humidity <= 100):
        return jsonify({'error': 'Humidity must be between 0 and 100%.'}), 400

    # Convert the data into a DataFrame with appropriate feature names
    features = pd.DataFrame([[pH_Value, Rainfall, Temperature, Humidity]], columns=['pH_Value', 'Rainfall', 'Temperature', 'Humidity'])

    # Make prediction using the model
    prediction = model.predict(features)

    # Return the result as a JSON response
    return jsonify({'predicted_crop': prediction[0]})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
