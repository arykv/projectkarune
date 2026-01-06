from scoring import score_sponsor_need, score_volunteer_need

def match_sponsors_to_need(need,sponsors):
    matches = []

    for sponsor in sponsors:
        score, reasons = score_sponsor_need(sponsor, need)
        matches.append({
            "sponsor_id": sponsor["id"],
            "score": score,
            "reasons": reasons
        })
    return sorted(matches, key=lambda x: x["score"], reverse=True)

def match_volunteers_to_need(need, volunteers):
    matches = []

    for volunteer in volunteers:
        score, reasons = score_volunteer_need(volunteer, need)
        matches.append({
            "volunteer_id": volunteer["id"],
            "score": score, 
            "reasons": reasons 
        })
    return sorted(matches, key=lambda x: x["score"], reverse=True)
