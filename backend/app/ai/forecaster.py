import datetime
import numpy as np
from typing import List, Dict

class TimeSeriesForecaster:
    """
    Statistical forecasting engine (Exponential Smoothing & Trend Extrapolation).
    Strictly separates MEASURED historical points from PREDICTED future points.
    """
    @staticmethod
    def forecast(
        history: List[Dict],
        value_key: str = "value",
        horizon_steps: int = 12,
        step_minutes: int = 5,
        alpha: float = 0.3
    ) -> Dict[str, List[Dict]]:
        """
        Input: history list of dicts with 'timestamp' and value_key.
        Returns dict with 'historical' and 'forecast' lists.
        """
        if not history:
            return {"historical": [], "forecast": []}

        # Format historical
        historical_points = []
        raw_values = []
        timestamps = []

        for item in history:
            val = item.get(value_key, 0.0)
            ts = item.get("timestamp")
            raw_values.append(val)
            historical_points.append({
                "timestamp": ts if isinstance(ts, str) else ts.isoformat(),
                "value": float(val),
                "data_type": "MEASURED",
                "upper_bound": float(val),
                "lower_bound": float(val)
            })

        if len(raw_values) == 1:
            last_val = raw_values[0]
            trend = 0.0
            std_err = 0.5
        else:
            # Exponential smoothing
            s = raw_values[0]
            for v in raw_values[1:]:
                s = alpha * v + (1 - alpha) * s
            
            # Simple trend calculation over last 5 points
            recent = raw_values[-5:]
            if len(recent) > 1:
                trend = (recent[-1] - recent[0]) / len(recent)
            else:
                trend = 0.0
            
            std_err = float(np.std(raw_values)) if len(raw_values) > 2 else 0.5
            last_val = s

        # Parse last timestamp
        last_ts_item = history[-1].get("timestamp")
        if isinstance(last_ts_item, str):
            try:
                last_dt = datetime.datetime.fromisoformat(last_ts_item.replace("Z", "+00:00"))
            except Exception:
                last_dt = datetime.datetime.utcnow()
        elif isinstance(last_ts_item, datetime.datetime):
            last_dt = last_ts_item
        else:
            last_dt = datetime.datetime.utcnow()

        forecast_points = []
        for i in range(1, horizon_steps + 1):
            future_dt = last_dt + datetime.timedelta(minutes=i * step_minutes)
            predicted_val = last_val + (trend * i)
            uncertainty = std_err * (1.0 + 0.15 * i)

            forecast_points.append({
                "timestamp": future_dt.isoformat(),
                "value": round(float(predicted_val), 3),
                "data_type": "PREDICTED",
                "upper_bound": round(float(predicted_val + uncertainty), 3),
                "lower_bound": round(float(predicted_val - uncertainty), 3)
            })

        return {
            "historical": historical_points,
            "forecast": forecast_points,
            "trend": "UPWARD" if trend > 0.05 else ("DOWNWARD" if trend < -0.05 else "STABLE"),
            "confidence": max(0.5, round(1.0 - (std_err / (abs(last_val) + 1.0)), 2))
        }
