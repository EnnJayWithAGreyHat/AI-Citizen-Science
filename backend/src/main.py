from __future__ import annotations

from collections.abc import Iterable
from datetime import date, datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="AI Citizen Science Demo API",
    version="0.1.0",
    description="Demo endpoints for the AI Citizen Science sponsor prototype.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PromptRequest(BaseModel):
    prompt: str


MAP_BOUNDS = {
    "west": 94.0,
    "east": 141.6,
    "north": 6.5,
    "south": -11.5,
}

CATEGORY_DEFINITIONS = [
    {"id": "tree", "label": "Trees", "color": "#648F5C"},
    {"id": "mammal", "label": "Mammals", "color": "#8C5F3C"},
    {"id": "shrub", "label": "Shrubs", "color": "#88A067"},
    {"id": "bird", "label": "Birds", "color": "#3E7A7C"},
    {"id": "coral", "label": "Corals", "color": "#D9854F"},
    {"id": "insect", "label": "Insects", "color": "#B49C55"},
]

SITE_CATALOG = {
    "gunung-leuser": {
        "siteName": "Gunung Leuser",
        "province": "Aceh",
        "ecosystem": "Rainforest edge",
        "latitude": 3.769,
        "longitude": 97.131,
    },
    "bukit-barisan": {
        "siteName": "Bukit Barisan",
        "province": "West Sumatra",
        "ecosystem": "Highland forest",
        "latitude": -0.948,
        "longitude": 100.363,
    },
    "jakarta-bay": {
        "siteName": "Jakarta Bay",
        "province": "Jakarta",
        "ecosystem": "Mangrove coast",
        "latitude": -6.047,
        "longitude": 106.741,
    },
    "bromo-highlands": {
        "siteName": "Bromo Highlands",
        "province": "East Java",
        "ecosystem": "Volcanic uplands",
        "latitude": -7.942,
        "longitude": 112.953,
    },
    "kutai": {
        "siteName": "Kutai",
        "province": "East Kalimantan",
        "ecosystem": "Lowland dipterocarp forest",
        "latitude": 0.53,
        "longitude": 117.417,
    },
    "tanjung-puting": {
        "siteName": "Tanjung Puting",
        "province": "Central Kalimantan",
        "ecosystem": "Peat swamp forest",
        "latitude": -2.838,
        "longitude": 111.956,
    },
    "lore-lindu": {
        "siteName": "Lore Lindu",
        "province": "Central Sulawesi",
        "ecosystem": "Montane forest",
        "latitude": -1.32,
        "longitude": 120.18,
    },
    "bali-barat": {
        "siteName": "Bali Barat",
        "province": "Bali",
        "ecosystem": "Dry forest and reef fringe",
        "latitude": -8.124,
        "longitude": 114.546,
    },
    "komodo": {
        "siteName": "Komodo Coast",
        "province": "East Nusa Tenggara",
        "ecosystem": "Savanna coast and reef",
        "latitude": -8.586,
        "longitude": 119.488,
    },
    "raja-ampat": {
        "siteName": "Raja Ampat",
        "province": "Southwest Papua",
        "ecosystem": "Coral reef seascape",
        "latitude": -0.429,
        "longitude": 130.821,
    },
    "halmahera": {
        "siteName": "Halmahera",
        "province": "North Maluku",
        "ecosystem": "Island rainforest",
        "latitude": 1.103,
        "longitude": 127.484,
    },
    "merauke": {
        "siteName": "Merauke Wetlands",
        "province": "South Papua",
        "ecosystem": "Wetland mosaic",
        "latitude": -8.493,
        "longitude": 140.404,
    },
}

DEMO_SIGHTINGS = [
    ("2025-01-08T09:15:00Z", "gunung-leuser", "mammal", "Sumatran orangutan", 1.65, 0.082, -0.051),
    ("2025-01-15T11:40:00Z", "jakarta-bay", "tree", "Rhizophora mangrove", 1.08, 0.034, 0.021),
    ("2025-01-20T14:20:00Z", "raja-ampat", "coral", "Acropora coral", 1.72, 0.041, 0.109),
    ("2025-01-29T08:50:00Z", "bali-barat", "bird", "Bali starling", 1.22, -0.028, 0.052),
    ("2025-02-05T10:05:00Z", "bukit-barisan", "shrub", "Senduduk shrub", 1.0, 0.048, -0.037),
    ("2025-02-12T07:55:00Z", "kutai", "mammal", "Proboscis monkey", 1.44, -0.071, 0.061),
    ("2025-02-18T16:10:00Z", "lore-lindu", "insect", "Wallacean birdwing", 1.12, 0.039, -0.046),
    ("2025-02-26T13:35:00Z", "komodo", "coral", "Table coral", 1.36, 0.058, -0.074),
    ("2025-03-04T09:30:00Z", "tanjung-puting", "mammal", "Bornean orangutan", 1.74, 0.029, 0.043),
    ("2025-03-11T12:15:00Z", "halmahera", "bird", "Standardwing bird-of-paradise", 1.31, 0.072, -0.038),
    ("2025-03-17T15:25:00Z", "merauke", "bird", "Southern crowned pigeon", 1.24, -0.037, 0.082),
    ("2025-03-25T08:05:00Z", "bromo-highlands", "shrub", "Javan edelweiss", 0.86, 0.047, -0.031),
    ("2025-04-03T06:50:00Z", "jakarta-bay", "bird", "Little egret", 0.98, -0.018, 0.047),
    ("2025-04-09T11:35:00Z", "raja-ampat", "coral", "Sea fan", 1.57, -0.054, 0.091),
    ("2025-04-18T13:55:00Z", "lore-lindu", "mammal", "Babirusa", 1.34, -0.062, 0.028),
    ("2025-04-26T10:45:00Z", "gunung-leuser", "tree", "Meranti tree", 1.23, 0.018, -0.024),
    ("2025-05-02T09:10:00Z", "bali-barat", "coral", "Staghorn coral", 1.18, 0.032, -0.059),
    ("2025-05-10T16:40:00Z", "kutai", "insect", "Lantern bug", 1.05, 0.051, 0.019),
    ("2025-05-19T14:05:00Z", "komodo", "shrub", "Coastal pandan shrub", 0.98, -0.053, 0.036),
    ("2025-05-27T07:20:00Z", "merauke", "tree", "Sago palm", 1.08, 0.024, -0.035),
    ("2025-06-06T08:45:00Z", "bukit-barisan", "tree", "Cinnamon tree", 1.09, -0.043, 0.057),
    ("2025-06-13T12:55:00Z", "tanjung-puting", "tree", "Ramin tree", 1.18, -0.048, 0.024),
    ("2025-06-21T15:30:00Z", "raja-ampat", "bird", "Red bird-of-paradise", 1.43, 0.011, -0.121),
    ("2025-06-28T11:10:00Z", "halmahera", "insect", "Atlas moth", 1.04, -0.029, 0.053),
    ("2025-07-07T09:25:00Z", "jakarta-bay", "insect", "Mangrove dragonfly", 1.0, 0.015, -0.049),
    ("2025-07-15T07:40:00Z", "lore-lindu", "bird", "Maleo", 1.39, 0.021, 0.062),
    ("2025-07-22T13:45:00Z", "komodo", "coral", "Brain coral", 1.42, -0.079, -0.042),
    ("2025-07-30T16:25:00Z", "gunung-leuser", "mammal", "Siamang", 1.27, -0.052, 0.029),
    ("2025-08-05T08:35:00Z", "kutai", "tree", "Ironwood sapling", 1.21, 0.076, -0.064),
    ("2025-08-13T10:50:00Z", "bali-barat", "bird", "Green peafowl", 1.11, -0.039, 0.026),
    ("2025-08-21T14:15:00Z", "bromo-highlands", "shrub", "Mountain heath", 0.91, -0.058, 0.044),
    ("2025-08-29T06:40:00Z", "merauke", "mammal", "Dusky pademelon", 1.19, 0.057, 0.014),
    ("2025-09-04T08:05:00Z", "tanjung-puting", "mammal", "Clouded leopard", 1.41, 0.041, -0.057),
    ("2025-09-12T12:20:00Z", "bukit-barisan", "mammal", "Sumatran serow", 1.28, 0.019, -0.052),
    ("2025-09-20T15:10:00Z", "halmahera", "bird", "Blyth's hornbill", 1.22, 0.046, 0.061),
    ("2025-09-27T11:35:00Z", "raja-ampat", "coral", "Brain coral", 1.66, -0.018, 0.047),
    ("2025-10-03T09:50:00Z", "lore-lindu", "shrub", "Forest tea shrub", 0.96, -0.034, -0.041),
    ("2025-10-11T07:15:00Z", "gunung-leuser", "insect", "Leaf insect", 0.97, 0.047, 0.072),
    ("2025-10-19T13:05:00Z", "jakarta-bay", "tree", "Nipah palm", 1.13, -0.044, -0.018),
    ("2025-10-28T10:25:00Z", "komodo", "bird", "Yellow-crested cockatoo", 1.28, 0.052, 0.031),
    ("2025-11-06T08:30:00Z", "kutai", "mammal", "Sun bear", 1.49, -0.024, 0.083),
    ("2025-11-14T12:45:00Z", "merauke", "tree", "Paperbark tree", 1.03, -0.028, -0.071),
    ("2025-11-23T15:00:00Z", "bali-barat", "tree", "Sea hibiscus", 1.02, 0.018, 0.074),
    ("2025-11-29T11:55:00Z", "raja-ampat", "coral", "Table coral", 1.61, 0.033, -0.054),
    ("2025-12-05T09:20:00Z", "bukit-barisan", "shrub", "Hill myrtle shrub", 0.94, -0.047, 0.024),
    ("2025-12-13T13:15:00Z", "halmahera", "tree", "Moluccan fig", 1.08, 0.024, -0.019),
    ("2025-12-20T08:10:00Z", "tanjung-puting", "tree", "Ulin tree", 1.26, -0.014, 0.058),
    ("2025-12-28T10:40:00Z", "lore-lindu", "mammal", "Sulawesi civet", 1.31, 0.051, -0.012),
]


def _dedupe(values: Iterable[str]) -> list[str]:
    seen: dict[str, None] = {}
    for value in values:
        seen.setdefault(value, None)
    return list(seen)


def _enumerate_days(start_day: str, end_day: str) -> list[str]:
    current = date.fromisoformat(start_day)
    end = date.fromisoformat(end_day)
    days: list[str] = []

    while current <= end:
        days.append(current.isoformat())
        current += timedelta(days=1)

    return days


def build_demo_sightings() -> list[dict[str, object]]:
    sightings: list[dict[str, object]] = []
    for index, (
        observed_at,
        site_id,
        category,
        species_name,
        intensity,
        latitude_offset,
        longitude_offset,
    ) in enumerate(
        DEMO_SIGHTINGS,
        start=1,
    ):
        site = SITE_CATALOG[site_id]
        sightings.append(
            {
                "id": f"s-{index:03d}",
                "observedAt": observed_at,
                "day": observed_at[:10],
                "month": observed_at[:7],
                "category": category,
                "speciesName": species_name,
                "intensity": intensity,
                "siteId": site_id,
                "siteName": site["siteName"],
                "province": site["province"],
                "ecosystem": site["ecosystem"],
                "latitude": round(site["latitude"] + latitude_offset, 4),
                "longitude": round(site["longitude"] + longitude_offset, 4),
            }
        )
    return sightings


def get_heatmap_payload() -> dict[str, object]:
    sightings = build_demo_sightings()
    available_days = _enumerate_days(sightings[0]["day"], sightings[-1]["day"])
    return {
        "datasetName": "Indonesia Biodiversity Sponsor Demo",
        "sourceNote": (
            "Curated, geographically clustered example sightings for sponsor walkthroughs "
            "and frontend prototyping."
        ),
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "bounds": MAP_BOUNDS,
        "availableDays": available_days,
        "availableMonths": _dedupe(sighting["month"] for sighting in sightings),
        "categories": CATEGORY_DEFINITIONS,
        "sightings": sightings,
    }


@app.get("/")
def read_root() -> dict[str, str]:
    return {
        "service": "ai-citizen-science-demo-api",
        "status": "ok",
        "message": "Use /api/heatmap for the biodiversity heat map demo data.",
    }


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/heatmap")
def biodiversity_heatmap() -> dict[str, object]:
    return get_heatmap_payload()


@app.post("/ai/prompt")
def prompt_demo(payload: PromptRequest) -> dict[str, str]:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    response = (
        "Demo assistant response: this backend is currently serving sponsor-ready sample data. "
        f"You asked about '{prompt[:120]}'. Connect your model pipeline here when the AI service is ready."
    )
    return {"response": response}
