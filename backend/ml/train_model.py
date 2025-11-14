import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

df = pd.read_csv("ml/fever_data.csv")
print(f"Data shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Classes: {df['outcome'].unique()}")

X = df[["temperature", "headache", "cough", "chills", "fatigue", "age", "days_since_onset"]]
y = df["outcome"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
model.fit(X_train, y_train)

train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Train score: {train_score:.4f}")
print(f"Test score: {test_score:.4f}")

os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/temp_model.pkl")
print("Model saved to models/temp_model.pkl")
