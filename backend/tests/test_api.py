from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_drag_models():
    """Test drag models endpoint."""
    response = client.get("/api/drag-models")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "G1" in data
    assert "G7" in data


def test_calculate_trajectory():
    """Test trajectory calculation."""
    test_data = {
        "weapon": {
            "sight_height": 2.0,
            "twist": 12.0
        },
        "ammo": {
            "bc": 0.5,
            "drag_model": "G1",
            "muzzle_velocity": 2800,
            "bullet_weight": 150
        },
        "atmosphere": {
            "temperature": 59,
            "pressure": 29.92,
            "humidity": 0.5,
            "altitude": 0
        },
        "wind": {
            "speed": 10,
            "direction": 3
        },
        "zero_distance": 100,
        "max_range": 500,
        "step_size": 25
    }

    response = client.post("/api/calculate", json=test_data)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "trajectory" in data
    assert "zero_adjustment" in data
    assert len(data["trajectory"]) > 0

    # Check trajectory point structure
    point = data["trajectory"][0]
    required_fields = [
        "distance", "drop", "windage", "velocity",
        "energy", "time", "drop_adjustment", "windage_adjustment"
    ]
    for field in required_fields:
        assert field in point


def test_invalid_calculation_data():
    """Test calculation with invalid data."""
    test_data = {
        "weapon": {
            "sight_height": -1.0  # Invalid sight height
        },
        "ammo": {
            "bc": 0.5,
            "drag_model": "G1",
            "muzzle_velocity": 2800
        },
        "atmosphere": {
            "temperature": 59,
            "pressure": 29.92,
            "humidity": 0.5,
            "altitude": 0
        },
        "wind": {
            "speed": 0,
            "direction": 3
        },
        "zero_distance": 100,
        "max_range": 500
    }

    response = client.post("/api/calculate", json=test_data)
    assert response.status_code == 422  # Validation error


def test_validation_endpoint():
    """Test parameter validation endpoint."""
    test_data = {
        "weapon": {
            "sight_height": 2.0
        },
        "ammo": {
            "bc": 0.5,
            "drag_model": "G1",
            "muzzle_velocity": 2800
        },
        "atmosphere": {
            "temperature": 59,
            "pressure": 29.92,
            "humidity": 0.5,
            "altitude": 0
        },
        "wind": {
            "speed": 0,
            "direction": 3
        },
        "zero_distance": 100,
        "max_range": 500,
        "step_size": 25
    }

    response = client.post("/api/validate", json=test_data)
    assert response.status_code == 200

    data = response.json()
    assert data["valid"] is True
    assert "estimated_points" in data
