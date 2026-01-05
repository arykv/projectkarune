# Firebase Authentication Setup

This project uses Firebase Authentication with email/password and role-based signup.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### 3. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 5. Update Configuration File

Open `js/firebase-config.js` and replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 6. Set Firestore Security Rules (Optional but Recommended)

In Firestore Database > Rules, update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Role-Based Signup**: Users select their role (Sponsor, Volunteer, or Shelter) during registration
- **Role Storage**: User roles are stored in Firestore and cached in localStorage
- **Protected Routes**: Dashboard pages check authentication and role before allowing access
- **Automatic Redirects**: Users are redirected to appropriate dashboards based on their role

## User Flow

1. **Registration** (`register.html`):
   - User enters name, email, password, and selects a role
   - Account is created in Firebase Auth
   - Role is stored in Firestore
   - User is redirected to their role-specific dashboard

2. **Login** (`login.html`):
   - User enters email and password
   - Firebase Auth authenticates the user
   - User role is fetched from Firestore
   - User is redirected to their role-specific dashboard

3. **Dashboard Access**:
   - Each dashboard checks authentication status
   - Verifies the user has the correct role
   - Redirects to login if not authenticated or wrong role

## File Structure

- `js/firebase-config.js` - Firebase configuration (replace with your config)
- `js/auth.js` - Firebase Authentication functions
- `login.html` - Login page
- `register.html` - Registration page with role selection
- `dashboard-sponsor.html` - Protected sponsor dashboard
- `dashboard-volunteer.html` - Protected volunteer dashboard
- `dashboard-shelter.html` - Protected shelter dashboard

## Notes

- User roles are stored in Firestore collection `users` with document ID = user UID
- Roles are cached in localStorage for quick access
- Firebase Auth state changes are monitored to keep UI in sync
- All dashboard pages require authentication and correct role
