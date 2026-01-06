from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

from matcher import match_sponsors_to_need, match_volunteers_to_need

app = FastAPI(title="Karune AI Engine")


class MatchRequest(BaseModel):
    need: Dict
    sponsors: List[Dict]
    volunteers: List[Dict]


@app.get("/")
def root():
    return {"status": "AI Engine Running"}


@app.post("/match")
def match(request: MatchRequest):
    sponsor_matches = match_sponsors_to_need(
        request.sponsors, request.need
    )
    volunteer_matches = match_volunteers_to_need(
        request.volunteers, request.need
    )

    return {
        "need": request.need,
        "sponsor_recommendations": sponsor_matches,
        "volunteer_recommendations": volunteer_matches,
    }

