import pandas as pd
import numpy as np
import random

rows = []
for i in range(500):
    cls = random.choices(["Normal", "Viral", "Bacterial"], weights=[0.6, 0.3, 0.1])[0]
    if cls == "Normal":
        temp = np.round(np.random.normal(36.8, 0.3), 1)
        headache = np.random.choice([0, 1], p=[0.8, 0.2])
        cough = np.random.choice([0, 1], p=[0.85, 0.15])
        chills = 0
    elif cls == "Viral":
        temp = np.round(np.random.normal(38.4, 0.7), 1)
        headache = np.random.choice([0, 1], p=[0.3, 0.7])
        cough = np.random.choice([0, 1], p=[0.5, 0.5])
        chills = np.random.choice([0, 1], p=[0.7, 0.3])
    else:
        temp = np.round(np.random.normal(39.5, 0.8), 1)
        headache = 1
        cough = np.random.choice([0, 1], p=[0.6, 0.4])
        chills = 1
    fatigue = np.random.choice([0, 1], p=[0.4, 0.6])
    age = random.randint(1, 80)
    days = random.randint(0, 7)
    rows.append([temp, headache, cough, chills, fatigue, age, days, cls])

df = pd.DataFrame(
    rows,
    columns=["temperature", "headache", "cough", "chills", "fatigue", "age", "days_since_onset", "outcome"]
)
df.to_csv("ml/fever_data.csv", index=False)
print("Synthetic data saved to ml/fever_data.csv")
