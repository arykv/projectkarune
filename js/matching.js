// Enhanced Matching System with Google Maps Integration
// Save as js/matching.js

import { calculateDistanceFromCoords } from './location.js';

/**
 * Calculate distance between two locations using stored coordinates
 * Falls back to 999 if coordinates are unavailable
 */
export function calculateDistance(location1, location2) {
  // Try to use coordinates first (most accurate)
  if (location1?.coordinates && location2?.coordinates) {
    const distance = calculateDistanceFromCoords(
      location1.coordinates,
      location2.coordinates
    );
    
    if (distance !== null) {
      return distance;
    }
  }

  // Fallback: return large distance if coordinates unavailable
  console.log('Coordinates unavailable for distance calculation');
  return 999;
}

/**
 * Score a need for a sponsor based on multiple factors
 * Returns score (0-100) and reasons for the match
 */
export function scoreNeedForSponsor(need, sponsor) {
  let score = 0;
  let reasons = [];

  // 1. Category Match (40 points) - HIGHEST PRIORITY
  if (sponsor.preferredCategories && Array.isArray(sponsor.preferredCategories)) {
    if (sponsor.preferredCategories.includes(need.category)) {
      score += 40;
      reasons.push(`✓ Matches your preferred category: ${need.category}`);
    } else if (sponsor.preferredCategories.length === 0) {
      // Give partial points if no preferences set
      score += 10;
    }
  }

  // 2. Location Proximity (35 points) - USING REAL COORDINATES
  const distance = calculateDistance(sponsor, need);
  
  if (distance < 999) {
    if (distance < 20) {
      score += 35;
      reasons.push(`📍 Very close - ${distance}km away in ${need.shelterCity || 'your area'}`);
    } else if (distance < 50) {
      score += 30;
      reasons.push(`📍 Nearby - ${distance}km away`);
    } else if (distance < 100) {
      score += 20;
      reasons.push(`📍 Same region - ${distance}km away`);
    } else if (distance < 300) {
      score += 10;
      reasons.push(`📍 Regional - ${distance}km away`);
    } else {
      score += 5;
      reasons.push(`📍 ${distance}km away`);
    }
  } else {
    // No coordinates available
    if (sponsor.city && need.shelterCity) {
      const sameCity = sponsor.city.toLowerCase() === need.shelterCity.toLowerCase();
      if (sameCity) {
        score += 30;
        reasons.push(`📍 Same city: ${need.shelterCity}`);
      } else {
        score += 5;
        reasons.push(`📍 Location: ${need.shelterCity}`);
      }
    }
  }

  // 3. Urgency Level (20 points)
  if (need.urgency === 'high') {
    score += 20;
    reasons.push('🚨 HIGH urgency - immediate help needed');
  } else if (need.urgency === 'medium') {
    score += 10;
    reasons.push('⚠️ Medium urgency');
  } else if (need.urgency === 'low') {
    score += 5;
    reasons.push('🕐 Low urgency');
  }

  // 4. Support Type Compatibility (5 points)
  if (need.supportType === 'donation' || need.supportType === 'both') {
    if (sponsor.donationType === 'monetary' || sponsor.donationType === 'both') {
      score += 5;
      reasons.push('💰 Accepts your donation type');
    }
  }

  return { 
    score, 
    reasons, 
    distance: distance < 999 ? distance : null 
  };
}

/**
 * Score a need for a volunteer based on skills and location
 */
export function scoreNeedForVolunteer(need, volunteer) {
  let score = 0;
  let reasons = [];

  // 1. Skills Match (45 points) - HIGHEST PRIORITY
  const categorySkillMap = {
    'Food': ['cooking', 'delivery', 'administration'],
    'Clothing': ['delivery', 'administration'],
    'Education': ['teaching', 'mentoring', 'technical', 'administration'],
    'Healthcare': ['healthcare', 'counseling', 'administration'],
    'Essentials': ['delivery', 'administration']
  };

  const relevantSkills = categorySkillMap[need.category] || [];
  const volunteerSkills = volunteer.skills || [];
  
  if (volunteerSkills.length > 0) {
    const matchedSkills = volunteerSkills.filter(s => relevantSkills.includes(s));
    
    if (matchedSkills.length > 0) {
      const skillPoints = Math.min(45, matchedSkills.length * 20);
      score += skillPoints;
      reasons.push(`✓ Your skills match: ${matchedSkills.join(', ')}`);
    } else {
      // Give some points for general willingness
      score += 15;
      reasons.push('✓ Your general skills can help');
    }
  }

  // 2. Location Proximity (35 points) - USING REAL COORDINATES
  const distance = calculateDistance(volunteer, need);
  
  if (distance < 999) {
    if (distance < 20) {
      score += 35;
      reasons.push(`📍 Very close - ${distance}km away in ${need.shelterCity || 'your area'}`);
    } else if (distance < 50) {
      score += 30;
      reasons.push(`📍 Nearby - ${distance}km away`);
    } else if (distance < 100) {
      score += 20;
      reasons.push(`📍 Same region - ${distance}km away`);
    } else if (distance < 300) {
      score += 10;
      reasons.push(`📍 Regional - ${distance}km away`);
    } else {
      score += 5;
      reasons.push(`📍 ${distance}km away`);
    }
  } else {
    // Fallback to city name comparison
    if (volunteer.city && need.shelterCity) {
      const sameCity = volunteer.city.toLowerCase() === need.shelterCity.toLowerCase();
      if (sameCity) {
        score += 30;
        reasons.push(`📍 Same city: ${need.shelterCity}`);
      } else {
        score += 5;
        reasons.push(`📍 Location: ${need.shelterCity}`);
      }
    }
  }

  // 3. Support Type Match (15 points)
  if (need.supportType === 'volunteer' || need.supportType === 'both') {
    score += 15;
    reasons.push('🤝 Actively seeking volunteers');
  } else {
    score += 5;
    reasons.push('🤝 May need volunteer support');
  }

  // 4. Age Group Preference Match (5 points)
  if (volunteer.preferredAgeGroup && need.ageGroup) {
    if (volunteer.preferredAgeGroup === need.ageGroup || 
        volunteer.preferredAgeGroup === 'any') {
      score += 5;
      reasons.push(`👥 Matches your age group preference`);
    }
  }

  return { 
    score, 
    reasons, 
    distance: distance < 999 ? distance : null 
  };
}

/**
 * Convert raw score to percentage (0-100)
 */
export function getMatchPercentage(score) {
  return Math.min(Math.round(score), 100);
}

/**
 * Get recommended needs for a user with enhanced scoring
 */
export async function getRecommendedNeeds(needs, userProfile, userRole) {
  if (!userProfile) {
    console.log('No user profile - returning all needs without scoring');
    return needs;
  }

  // Ensure user has required location data
  if (!userProfile.city) {
    console.log('User missing city - recommendations may be limited');
  }

  const scoringFunction = userRole === 'sponsor' 
    ? scoreNeedForSponsor 
    : scoreNeedForVolunteer;

  // Score all needs
  const scored = needs.map(need => {
    const scoring = scoringFunction(need, userProfile);
    return {
      ...need,
      scoring
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => {
    // Primary sort: by score
    if (b.scoring.score !== a.scoring.score) {
      return b.scoring.score - a.scoring.score;
    }
    
    // Secondary sort: by distance (if available)
    const distA = a.scoring.distance || 9999;
    const distB = b.scoring.distance || 9999;
    return distA - distB;
  });

  // Log top matches for debugging
  if (scored.length > 0) {
    console.log(`✓ Scored ${scored.length} needs`);
    console.log(`Top match: ${scored[0]?.title} (${scored[0]?.scoring?.score} points)`);
    if (scored[0]?.scoring?.distance) {
      console.log(`Distance: ${scored[0].scoring.distance}km`);
    }
  }

  return scored;
}

/**
 * Check if user profile is complete enough for good recommendations
 */
export function isProfileComplete(profile, role) {
  if (!profile) return false;
  
  const hasCity = !!profile.city;
  const hasCoordinates = !!(profile.coordinates?.lat && profile.coordinates?.lng);
  
  if (role === 'sponsor') {
    const hasPreferences = profile.preferredCategories && 
                          profile.preferredCategories.length > 0;
    return hasCity && hasPreferences;
  } else if (role === 'volunteer') {
    const hasSkills = profile.skills && profile.skills.length > 0;
    return hasCity && hasSkills;
  } else if (role === 'shelter') {
    return hasCity;
  }
  
  return hasCity;
}

/**
 * Get profile completion suggestions
 */
export function getProfileCompletionSuggestions(profile, role) {
  const suggestions = [];
  
  if (!profile) {
    return ['Complete your profile to get better recommendations'];
  }
  
  if (!profile.city) {
    suggestions.push('Add your city for location-based matching');
  }
  
  if (!profile.coordinates?.lat || !profile.coordinates?.lng) {
    suggestions.push('Enable location for accurate distance calculations');
  }
  
  if (role === 'sponsor') {
    if (!profile.preferredCategories || profile.preferredCategories.length === 0) {
      suggestions.push('Select preferred categories to see relevant needs');
    }
  } else if (role === 'volunteer') {
    if (!profile.skills || profile.skills.length === 0) {
      suggestions.push('Add your skills for better opportunity matching');
    }
  }
  
  return suggestions;
}

/**
 * Filter needs by distance radius
 */
export function filterNeedsByDistance(needs, userProfile, maxDistanceKm) {
  if (!userProfile?.coordinates) {
    console.log('Cannot filter by distance - user coordinates unavailable');
    return needs;
  }
  
  return needs.filter(need => {
    const distance = calculateDistance(userProfile, need);
    return distance < maxDistanceKm;
  });
}