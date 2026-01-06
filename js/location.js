// Enhanced Location Picker using Google Places API (New)
// Save as js/location.js

let autocompleteInstance = null;
let geocoder = null;

/**
 * Initialize Google Places Autocomplete on an input field
 * Uses the new Places API with enhanced features
 */
export function initLocationPicker(inputId, onPlaceSelected) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`Input element ${inputId} not found`);
    return;
  }

  // Wait for Google Maps API to load
  if (typeof google === 'undefined' || !google.maps) {
    console.error('Google Maps API not loaded');
    return;
  }

  // Initialize geocoder if not already initialized
  if (!geocoder) {
    geocoder = new google.maps.Geocoder();
  }

  // Configure autocomplete with enhanced options
  const options = {
    types: ['(cities)'], // Only cities
    componentRestrictions: { country: 'in' }, // India only
    fields: [
      'name',
      'geometry',
      'formatted_address',
      'address_components',
      'place_id'
    ]
  };

  // Create autocomplete instance
  autocompleteInstance = new google.maps.places.Autocomplete(input, options);

  // Listen for place selection
  autocompleteInstance.addListener('place_changed', () => {
    const place = autocompleteInstance.getPlace();

    if (!place.geometry) {
      console.error('No geometry for selected place');
      input.classList.add('border-red-500');
      return;
    }

    input.classList.remove('border-red-500');

    // Extract comprehensive location data
    const locationData = extractLocationData(place);

    // Call callback with enhanced location data
    if (onPlaceSelected) {
      onPlaceSelected(locationData);
    }
  });

  // Add input validation
  input.addEventListener('blur', () => {
    if (input.value && !autocompleteInstance.getPlace()?.geometry) {
      input.classList.add('border-yellow-500');
    }
  });

  input.addEventListener('focus', () => {
    input.classList.remove('border-yellow-500');
  });
}

/**
 * Extract comprehensive location data from Google Place
 */
function extractLocationData(place) {
  const components = place.address_components || [];
  
  let city = '';
  let state = '';
  let country = '';
  let district = '';

  // Extract address components
  for (const component of components) {
    const types = component.types;
    
    if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      district = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.long_name;
    } else if (types.includes('country')) {
      country = component.long_name;
    }
  }

  // Use district if city not found (for smaller towns)
  if (!city && district) {
    city = district;
  }

  // Use place name as fallback
  if (!city) {
    city = place.name;
  }

  const coordinates = {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng()
  };

  return {
    city: city,
    state: state,
    country: country,
    formatted: place.formatted_address,
    coordinates: coordinates,
    placeId: place.place_id
  };
}

/**
 * Get user's current location using browser geolocation
 * Then reverse geocode to get city details
 */
export function getCurrentLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation is not supported by your browser');
    return;
  }

  // Show loading state
  const notification = showLocationLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        if (!geocoder) {
          geocoder = new google.maps.Geocoder();
        }

        const latlng = { lat: latitude, lng: longitude };
        
        geocoder.geocode({ location: latlng }, (results, status) => {
          notification.remove();
          
          if (status === 'OK' && results[0]) {
            const locationData = extractLocationData(results[0]);
            
            if (onSuccess) {
              onSuccess(locationData);
            }
          } else {
            console.error('Geocoding failed:', status);
            if (onError) {
              onError('Could not determine your location. Please enter manually.');
            }
          }
        });
      } catch (error) {
        notification.remove();
        console.error('Geocoding error:', error);
        if (onError) onError(error.message);
      }
    },
    (error) => {
      notification.remove();
      let errorMessage = 'Unable to get your location. ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location permission denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timed out.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
      }
      
      if (onError) onError(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistanceFromCoords(coord1, coord2) {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * 
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validate location data completeness
 */
export function isLocationDataValid(locationData) {
  return (
    locationData &&
    locationData.city &&
    locationData.coordinates &&
    locationData.coordinates.lat &&
    locationData.coordinates.lng
  );
}

/**
 * Show loading notification for location detection
 */
function showLocationLoading() {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-blue-500 text-white flex items-center gap-2';
  notification.innerHTML = `
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Detecting your location...</span>
  `;
  document.body.appendChild(notification);
  return notification;
}

/**
 * Get city name from coordinates (reverse geocoding)
 * Useful for programmatic location lookups
 */
export async function getCityFromCoordinates(lat, lng) {
  return new Promise((resolve, reject) => {
    if (!geocoder) {
      geocoder = new google.maps.Geocoder();
    }

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const locationData = extractLocationData(results[0]);
        resolve(locationData);
      } else {
        reject(new Error('Geocoding failed: ' + status));
      }
    });
  });
}

/**
 * Prefill location input if user has saved location
 */
export function prefillSavedLocation(inputId, savedLocationData) {
  const input = document.getElementById(inputId);
  if (input && savedLocationData && savedLocationData.city) {
    input.value = savedLocationData.city;
  }
}