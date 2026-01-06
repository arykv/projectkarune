from data.fake_needs import needs
from data.fake_sponsors import sponsors
from data.fake_volunteers import volunteers
from matcher import match_sponsors_to_need, match_volunteers_to_need 
from explain import explain_match

print("AI Engine started")

need = needs[0]

print("Need:", need)

print("\n Sponsor Recommendations:")
sponsor_matches = match_sponsors_to_need(need, sponsors)
for match in sponsor_matches:
    print(match)
    print(explain_match(match))

    
print("\n Volunteer Recommendations:")
volunteer_matches=match_volunteers_to_need(need,volunteers)
for match in volunteer_matches:
    print(match)
    print(explain_match(match))
