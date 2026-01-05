// Utility functions for Karune Connect

// Get user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('karuneUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Set user in localStorage
function setCurrentUser(user) {
  localStorage.setItem('karuneUser', JSON.stringify(user));
}

// Clear user from localStorage (logout)
function clearCurrentUser() {
  localStorage.removeItem('karuneUser');
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'register.html';
  }
}

// Format numbers with commas
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Show toast notification
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Animate counter
export function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const range = target - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = formatNumber(Math.round(target));
      clearInterval(timer);
    } else {
      element.textContent = formatNumber(Math.round(current));
    }
  }, 16);
}

// Update progress bar - ADDED THIS FUNCTION
export function updateProgress(id, current, total) {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  const percentElement = document.getElementById(`${id}-percent`);
  const barElement = document.getElementById(`${id}-bar`);
  
  if (percentElement) {
    percentElement.textContent = `${percentage}%`;
  }
  
  if (barElement) {
    setTimeout(() => {
      barElement.style.width = `${percentage}%`;
    }, 100);
  }
}

// Load JSON data
export async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to load data');
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return {};
  }
}