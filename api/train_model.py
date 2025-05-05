
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# 1. Load the dataset
DATA_PATH = 'Crop_Recommendation.csv'

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Dataset file '{DATA_PATH}' not found! Please check the path.")

data = pd.read_csv(DATA_PATH)

# 2. Select features and target
FEATURES = ['pH_Value', 'Rainfall', 'Temperature', 'Humidity']
TARGET = 'Crop'

X = data[FEATURES]
y = data[TARGET]

# 3. Split the dataset into train and test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Create and train the model
model = RandomForestClassifier(
    n_estimators=100,   # 100 trees
    random_state=42,
    n_jobs=-1,          # use all CPU cores
    verbose=0           # no training noise
)
model.fit(X_train, y_train)

# 5. Evaluate the model
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

train_accuracy = accuracy_score(y_train, y_pred_train)
test_accuracy = accuracy_score(y_test, y_pred_test)

# print("✅ Model training completed!")
# print(f"📈 Training Accuracy: {train_accuracy:.4f}")
# print(f"📊 Testing Accuracy: {test_accuracy:.4f}")

# print("\n📜 Classification Report on Test Data:")
# print(classification_report(y_test, y_pred_test))

# 6. Save the trained model
MODEL_FILENAME = 'model.pkl'
joblib.dump(model, MODEL_FILENAME)

print(f"\n💾 Trained model saved as '{MODEL_FILENAME}'. Ready to use!")
