// Enhanced Matching and Scoring Algorithm for Karune Connect

// Expanded city coordinates database for India
const cityCoords = {
  // Metro Cities
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  
  // Tier 2 Cities
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'pimpri-chinchwad': { lat: 18.6298, lng: 73.7997 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'vadodara': { lat: 22.3072, lng: 73.1812 },
  'ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'ludhiana': { lat: 30.9010, lng: 75.8573 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'faridabad': { lat: 28.4089, lng: 77.3178 },
  'meerut': { lat: 28.9845, lng: 77.7064 },
  'rajkot': { lat: 22.3039, lng: 70.8022 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'amritsar': { lat: 31.6340, lng: 74.8723 },
  'allahabad': { lat: 25.4358, lng: 81.8463 },
  'prayagraj': { lat: 25.4358, lng: 81.8463 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'howrah': { lat: 22.5958, lng: 88.2636 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'jabalpur': { lat: 23.1815, lng: 79.9864 },
  'gwalior': { lat: 26.2183, lng: 78.1828 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'kota': { lat: 25.2138, lng: 75.8648 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 }
};

// Calculate distance between two cities in km
export function calculateDistance(city1, city2) {
  if (!city1 || !city2) return 999;

  const c1 = cityCoords[city1.toLowerCase().trim()] || null;
  const c2 = cityCoords[city2.toLowerCase().trim()] || null;

  if (!c1 || !c2) {
    console.log(`Unknown city: ${!c1 ? city1 : city2}`);
    return 999;
  }

  // Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLng = (c2.lng - c1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Score a need for a sponsor
export function scoreNeedForSponsor(need, sponsor) {
  let score = 0;
  let reasons = [];

  // 1. Category Match (40 points)
  if (sponsor.preferredCategories && Array.isArray(sponsor.preferredCategories)) {
    if (sponsor.preferredCategories.includes(need.category)) {
      score += 40;
      reasons.push(`Matches your preferred category: ${need.category}`);
    }
  }

  // 2. Location Proximity (30 points)
  const distance = calculateDistance(sponsor.city, need.shelterCity);
  if (distance < 50) {
    score += 30;
    reasons.push(`Very close - ${distance}km away`);
  } else if (distance < 150) {
    score += 20;
    reasons.push(`Nearby - ${distance}km away`);
  } else if (distance < 300) {
    score += 10;
    reasons.push(`In your region - ${distance}km away`);
  } else if (distance < 999) {
    score += 5;
    reasons.push(`${distance}km away`);
  }

  // 3. Urgency Multiplier (20 points)
  if (need.urgency === 'high') {
    score += 20;
    reasons.push('HIGH urgency - needs immediate help');
  } else if (need.urgency === 'medium') {
    score += 10;
    reasons.push('Medium urgency');
  }

  // 4. Support Type Match (10 points)
  if (need.supportType === 'donation' || need.supportType === 'both') {
    if (sponsor.donationType === 'monetary' || sponsor.donationType === 'both') {
      score += 10;
      reasons.push('Accepts monetary donations');
    }
  }

  return { 
    score, 
    reasons, 
    distance: distance < 999 ? distance : null 
  };
}

// Score a need for a volunteer
export function scoreNeedForVolunteer(need, volunteer) {
  let score = 0;
  let reasons = [];

  // 1. Category-to-Skill Match (50 points)
  const categorySkillMap = {
    'Education': ['teaching', 'mentoring', 'technical'],
    'Healthcare': ['healthcare', 'counseling'],
    'Food': ['cooking', 'delivery'],
    'Clothing': ['delivery', 'administration'],
    'Essentials': ['delivery', 'administration']
  };

  const relevantSkills = categorySkillMap[need.category] || [];
  const volunteerSkills = volunteer.skills || [];
  const matchedSkills = volunteerSkills.filter(s => relevantSkills.includes(s));
  
  if (matchedSkills.length > 0) {
    const points = Math.min(50, matchedSkills.length * 25);
    score += points;
    reasons.push(`Your skills match: ${matchedSkills.join(', ')}`);
  } else if (volunteerSkills.length > 0) {
    // Give some points for having any skills
    score += 10;
    reasons.push('Your general skills can help');
  }

  // 2. Location Proximity (30 points)
  const distance = calculateDistance(volunteer.city, need.shelterCity);
  if (distance < 50) {
    score += 30;
    reasons.push(`Very close - ${distance}km away`);
  } else if (distance < 150) {
    score += 20;
    reasons.push(`Nearby - ${distance}km away`);
  } else if (distance < 300) {
    score += 10;
    reasons.push(`In your region - ${distance}km away`);
  } else if (distance < 999) {
    score += 5;
    reasons.push(`${distance}km away`);
  }

  // 3. Support Type Match (20 points)
  if (need.supportType === 'volunteer' || need.supportType === 'both') {
    score += 20;
    reasons.push('Needs volunteer support');
  }

  return { 
    score, 
    reasons, 
    distance: distance < 999 ? distance : null 
  };
}

// Get match percentage from score (0-100)
export function getMatchPercentage(score) {
  // Max possible score is 100, so convert to percentage
  return Math.min(Math.round(score), 100);
}

// Get recommended needs for a user
export async function getRecommendedNeeds(needs, userProfile, userRole) {
  if (!userProfile) {
    console.log('No user profile - returning all needs without scoring');
    return needs;
  }

  const scoringFunction = userRole === 'sponsor' 
    ? scoreNeedForSponsor 
    : scoreNeedForVolunteer;

  const scored = needs.map(need => {
    const scoring = scoringFunction(need, userProfile);
    return {
      ...need,
      scoring
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.scoring.score - a.scoring.score);

  console.log(`Scored ${scored.length} needs. Top match: ${scored[0]?.scoring?.score || 0} points`);

  return scored;
}

// Check if user profile is complete for recommendations
export function isProfileComplete(profile, role) {
  if (!profile) return false;
  
  const hasCity = !!profile.city;
  
  if (role === 'sponsor') {
    const hasPreferences = profile.preferredCategories && profile.preferredCategories.length > 0;
    return hasCity && hasPreferences;
  } else if (role === 'volunteer') {
    const hasSkills = profile.skills && profile.skills.length > 0;
    return hasCity && hasSkills;
  }
  
  return hasCity;
}