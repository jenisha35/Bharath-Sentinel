import numpy as np
import pandas as pd
from typing import Dict, Tuple, Optional
from sklearn.ensemble import IsolationForest

class SensorAnomalyDetector:
    """
    Lightweight, explainable AI anomaly detection pipeline:
    1. Rolling Z-Score statistics
    2. Scikit-learn IsolationForest model
    """
    def __init__(self, history_size: int = 50):
        self.history_size = history_size
        self.history: Dict[str, list] = {}
        self.model = IsolationForest(n_estimators=30, contamination=0.05, random_state=42)
        self.is_fitted = False

    def update_and_detect(self, sensor_name: str, value: float) -> Tuple[bool, float, float, str]:
        """
        Returns (is_anomaly, baseline, anomaly_score, severity).
        anomaly_score ranges 0.0 (normal) to 1.0 (severe).
        """
        if sensor_name not in self.history:
            self.history[sensor_name] = []
        
        self.history[sensor_name].append(value)
        if len(self.history[sensor_name]) > self.history_size:
            self.history[sensor_name].pop(0)

        series = np.array(self.history[sensor_name])
        baseline = float(np.mean(series))
        std = float(np.std(series))

        if len(series) < 5 or std < 1e-4:
            return False, baseline, 0.0, "LOW"

        # Z-Score check
        z_score = abs((value - baseline) / std)

        # Fit isolation forest if enough history
        if len(series) >= 15:
            X = series.reshape(-1, 1)
            self.model.fit(X)
            score = float(-self.model.score_samples([[value]])[0])
            # Scale score to 0..1
            anomaly_score = max(0.0, min(1.0, (score - 0.3) / 0.5))
        else:
            anomaly_score = max(0.0, min(1.0, z_score / 4.0))

        is_anomaly = (z_score > 2.5 or anomaly_score > 0.65)

        if anomaly_score > 0.85 or z_score > 4.0:
            severity = "CRITICAL"
        elif anomaly_score > 0.65 or z_score > 3.0:
            severity = "HIGH"
        elif is_anomaly:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        return is_anomaly, baseline, anomaly_score, severity
