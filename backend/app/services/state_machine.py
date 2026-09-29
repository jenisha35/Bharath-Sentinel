import datetime
from typing import Tuple, Dict

class SafetyStateMachine:
    """
    Finite State Machine managing BHARATH SENTINEL vessel mission & safety state transitions.
    States: IDLE, MISSION_START, NORMAL_OPERATION, WARNING, OBSTACLE_AVOIDANCE,
            ADAPTIVE_SAMPLING, LOW_BATTERY, SHUTTER_CLOSING, SAFE_MODE, RECOVERY, FAULT.
    Shutter: OPEN, OPENING, CLOSING, CLOSED, FAULT.
    """
    def __init__(self, boat_id: str):
        self.boat_id = boat_id
        self.current_state = "NORMAL_OPERATION"
        self.shutter_state = "OPEN"
        self.overall_status = "GREEN"  # GREEN, YELLOW, RED
        self.shutter_timer = 0.0

    def evaluate_triggers(
        self,
        obstacle_risk: str,
        battery_pct: float,
        leak_detected: bool,
        sensor_health_avg: float,
        is_adaptive_active: bool,
        manual_command: str = None
    ) -> Tuple[str, str, str, bool]:
        """
        Evaluates inputs and updates state.
        Returns (mission_state, shutter_state, overall_status, state_changed).
        """
        previous_state = self.current_state
        previous_shutter = self.shutter_state
        previous_status = self.overall_status

        # Manual shutter commands override
        if manual_command == "CLOSE_HUB":
            self.shutter_state = "CLOSING"
            self.current_state = "SAFE_MODE"
            self.overall_status = "RED"
        elif manual_command == "OPEN_HUB":
            self.shutter_state = "OPENING"
            self.current_state = "NORMAL_OPERATION"
            self.overall_status = "GREEN"

        # Handle animated shutter transitions
        if self.shutter_state == "CLOSING":
            self.shutter_timer += 2.0
            if self.shutter_timer >= 4.0:
                self.shutter_state = "CLOSED"
                self.shutter_timer = 0.0
        elif self.shutter_state == "OPENING":
            self.shutter_timer += 2.0
            if self.shutter_timer >= 4.0:
                self.shutter_state = "OPEN"
                self.shutter_timer = 0.0

        # Autonomous safety logic
        if leak_detected or battery_pct < 10.0 or sensor_health_avg < 30.0:
            self.overall_status = "RED"
            self.current_state = "SAFE_MODE"
            if self.shutter_state not in ["CLOSING", "CLOSED"]:
                self.shutter_state = "CLOSING"

        elif obstacle_risk == "CRITICAL":
            self.overall_status = "RED"
            self.current_state = "OBSTACLE_AVOIDANCE"
            # If obstacle is extremely close (< 25m), trigger shutter protection
            if battery_pct < 15.0:
                self.shutter_state = "CLOSING"

        elif obstacle_risk == "WARNING" or battery_pct < 25.0 or sensor_health_avg < 70.0:
            self.overall_status = "YELLOW"
            if self.current_state not in ["OBSTACLE_AVOIDANCE", "ADAPTIVE_SAMPLING", "SAFE_MODE"]:
                self.current_state = "WARNING" if battery_pct >= 25.0 else "LOW_BATTERY"

        elif is_adaptive_active:
            self.overall_status = "GREEN"
            self.current_state = "ADAPTIVE_SAMPLING"

        elif self.shutter_state == "OPEN" and self.current_state not in ["SAFE_MODE", "FAULT"]:
            self.overall_status = "GREEN"
            self.current_state = "NORMAL_OPERATION"

        state_changed = (
            self.current_state != previous_state or
            self.shutter_state != previous_shutter or
            self.overall_status != previous_status
        )

        return self.current_state, self.shutter_state, self.overall_status, state_changed
