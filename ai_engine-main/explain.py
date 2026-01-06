def explain_match(match):
    explanation = "Matched because:\n"
    for reason in match["reasons"]:
        explanation += f"- {reason}\n"
    return explanation

