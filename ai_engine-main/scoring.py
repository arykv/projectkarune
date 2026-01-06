def score_sponsor_need(sponsor, need):
    score = 0
    reasons =[]

    if sponsor["location"] == need["location"]:
        score+=3
        reasons.append("Same location")

    if need["category"] in sponsor["preferred_categories"]:
        score+=4
        reasons.append("Category match")
    
    if sponsor["capacity"] >= need["quantity"]:
        score+=2
        reasons.append("Sufficient capacity")

    score+= need["urgency"]
    reasons.append(f"Urgency level {need['urgency']}")

    return score, reasons 

def score_volunteer_need(volunteer, need):
    score=0
    reasons= []

    if volunteer["location"] == need["location"]:
        score+=3
        reasons.append("Skill match")

    if volunteer["availability"] > 0:
        score +=2
        reasons.append("Available")

    
    score += need["urgency"]
    reasons.append(f"Urgency level {need['urgency']}")

    return score, reasons