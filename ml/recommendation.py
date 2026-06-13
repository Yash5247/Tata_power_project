"""Predictive maintenance recommendation engine."""
from ml.config import RISK_CATEGORIES


def get_risk_category(failure_probability: float) -> str:
    """Map failure probability to industrial risk category."""
    prob = max(0.0, min(1.0, failure_probability))
    for category, (low, high) in RISK_CATEGORIES.items():
        if low <= prob < high:
            return category
    return "Critical"


def get_health_score(failure_probability: float) -> float:
    """Convert failure probability to equipment health percentage."""
    return round((1 - max(0.0, min(1.0, failure_probability))) * 100, 1)


def get_maintenance_recommendation(
    failure_probability: float,
    failure_types: dict | None = None,
) -> dict:
    """Generate maintenance recommendation based on risk and failure modes."""
    risk = get_risk_category(failure_probability)
    health = get_health_score(failure_probability)
    failure_types = failure_types or {}

    recommendations = {
        "Healthy": {
            "action": "Continue routine monitoring",
            "priority": "Low",
            "schedule_days": 90,
            "description": "Equipment operating within normal parameters. Maintain standard inspection cycle.",
        },
        "Low Risk": {
            "action": "Schedule preventive inspection",
            "priority": "Low-Medium",
            "schedule_days": 60,
            "description": "Minor deviations detected. Plan preventive maintenance within 60 days.",
        },
        "Medium Risk": {
            "action": "Plan component inspection and lubrication",
            "priority": "Medium",
            "schedule_days": 30,
            "description": "Elevated failure indicators. Inspect bearings, cooling systems, and tool wear.",
        },
        "High Risk": {
            "action": "Urgent maintenance required",
            "priority": "High",
            "schedule_days": 7,
            "description": "High probability of failure. Schedule maintenance within 7 days and reduce load.",
        },
        "Critical": {
            "action": "Immediate shutdown and emergency maintenance",
            "priority": "Critical",
            "schedule_days": 1,
            "description": "Critical failure risk detected. Stop equipment and dispatch maintenance team immediately.",
        },
    }

    base = recommendations[risk].copy()
    base["risk_category"] = risk
    base["health_score"] = health

    mode_map = {
        "TWF": "Tool Wear Failure — replace worn tooling and recalibrate",
        "HDF": "Heat Dissipation Failure — inspect cooling system and thermal paste",
        "PWF": "Power Failure — check power supply and voltage regulators",
        "OSF": "Overstrain Failure — reduce operational load and inspect bearings",
        "RNF": "Random Failure — perform comprehensive diagnostic scan",
    }

    active_modes = [mode_map[k] for k, v in failure_types.items() if v == 1]
    if active_modes:
        base["failure_mode_notes"] = active_modes
        base["description"] += " Detected failure modes: " + "; ".join(active_modes)

    return base


def map_status(risk_category: str) -> str:
    """Map risk category to dashboard status for backward compatibility."""
    mapping = {
        "Healthy": "healthy",
        "Low Risk": "healthy",
        "Medium Risk": "warning",
        "High Risk": "warning",
        "Critical": "critical",
    }
    return mapping.get(risk_category, "warning")
