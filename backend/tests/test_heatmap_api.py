from fastapi.testclient import TestClient

from src.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_heatmap_payload_shape():
    response = client.get("/api/heatmap")

    assert response.status_code == 200

    payload = response.json()

    assert payload["datasetName"] == "Indonesia Biodiversity Sponsor Demo"
    assert payload["bounds"]["west"] < payload["bounds"]["east"]
    assert payload["bounds"]["south"] < payload["bounds"]["north"]
    assert payload["availableDays"][0] == "2025-01-08"
    assert payload["availableDays"][-1] == "2025-12-28"
    assert payload["availableMonths"][0] == "2025-01"
    assert payload["availableMonths"][-1] == "2025-12"
    assert len(payload["sightings"]) == 48

    categories = {category["id"] for category in payload["categories"]}
    assert {"tree", "mammal", "shrub", "bird", "coral", "insect"} <= categories

    first_sighting = payload["sightings"][0]
    assert first_sighting["siteName"] == "Gunung Leuser"
    assert first_sighting["category"] == "mammal"
    assert first_sighting["day"] == "2025-01-08"
    assert isinstance(first_sighting["latitude"], float)
