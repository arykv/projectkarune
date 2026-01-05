// Firebase Authentication utilities using ES modules
import { auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Sign up with email and password
export async function signUpWithEmail(email, password, name, role) {
  try {
    // Create user with email/password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Store role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      role: role,
      createdAt: serverTimestamp()
    });
    
    // Also store role in localStorage for quick access
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    
    return { success: true, user: user };
  } catch (error) {
    let errorMessage = 'Sign up failed. ';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += 'Email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage += 'Password should be at least 6 characters.';
        break;
      default:
        errorMessage += error.message;
    }
    return { success: false, error: errorMessage };
  }
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userName', userData.name || user.displayName || '');
    } else {
      // Fallback: try to get from user metadata or set default
      localStorage.setItem('userName', user.displayName || '');
    }
    
    return { success: true, user: user };
  } catch (error) {
    let errorMessage = 'Login failed. ';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage += 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage += 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage += 'This account has been disabled.';
        break;
      default:
        errorMessage += error.message;
    }
    return { success: false, error: errorMessage };
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentFirebaseUser() {
  return auth.currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
  return auth.currentUser !== null;
}

// Get user role from localStorage (set after login)
export function getUserRole() {
  return localStorage.getItem('userRole');
}

// Get user name
export function getUserName() {
  return localStorage.getItem('userName') || (auth.currentUser && auth.currentUser.displayName) || '';
}

// Listen to auth state changes
export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user role from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          localStorage.setItem('userRole', userData.role);
          localStorage.setItem('userName', userData.name || user.displayName || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
    callback(user);
  });
}
