import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, NotificationMessage, Department, NotificationType } from '../types';

const auth = getAuth();

// Passkey constants remain for initial admin login logic
const SUPER_ADMIN_PASSKEY = 'ykls_764';
const DEPARTMENT_PASSKEYS: { [key in Department]: string } = {
    [Department.Electrical]: 'ljn_9871',
    [Department.Water]: 'ljn_9872',
    [Department.Medical]: 'ljn_9873',
    [Department.Sanitation]: 'ljn_9874',
    [Department.Roads]: 'ljn_9875',
};

// --- User Profile Management (Firestore) ---

// Get a user's full profile from Firestore
export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        return userSnap.data() as User;
    }
    return null;
};

// --- Authentication Logic (Firebase Auth) ---

export const signUp = async (username: string, email: string, password: string, department?: Department): Promise<User> => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        throw new Error('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser: User = {
        id: firebaseUser.uid,
        username: username,
        email: email.toLowerCase(),
        isAdmin: email.toLowerCase().includes('@city.gov'),
        notifications: [],
        department: department,
    };
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    
    return newUser;
};

export const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await getUserProfile(userCredential.user.uid);
    if (!userProfile) {
        throw new Error("Could not find user profile.");
    }
    return userProfile;
};

export const loginAsSuperAdmin = async (passkey: string): Promise<User> => {
    if (passkey !== SUPER_ADMIN_PASSKEY) {
        throw new Error('Invalid Super Admin Passkey.');
    }
    // Super admin uses a default email/password for the initial sign-in
    const email = 'admin@city.gov';
    const password = 'default_admin_password_placeholder'; // In a real app, this should be more secure
    
    try {
        return await signIn(email, password);
    } catch (error: any) {
        // If the admin user doesn't exist, create it
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            return await signUp('admin', email, password);
        }
        throw error;
    }
};

export const loginAsDepartmentAdmin = async (department: Department, passkey: string): Promise<User> => {
    if (DEPARTMENT_PASSKEYS[department] !== passkey) {
        throw new Error('Invalid Passkey for this department.');
    }
    
    const email = `${department.toLowerCase()}@city.gov`;
    const password = 'default_dept_password'; // Keep it simple for demo purposes
    
    try {
        return await signIn(email, password);
    } catch (error: any) {
         if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            return await signUp(department, email, password, department);
        }
        throw error;
    }
};

export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
    return onFirebaseAuthStateChanged(auth, callback);
};

// --- Password Reset ---

export const requestPasswordReset = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
};

export const resetPassword = (oobCode: string, newPassword: string): Promise<void> => {
    return confirmPasswordReset(auth, oobCode, newPassword);
};


// --- Notifications (Firestore) ---

export const addNotification = async (
    userId: string, 
    message: string, 
    type: NotificationType,
    deliveryMethod: 'in-app' | 'email' = 'in-app',
    emailContent?: NotificationMessage['emailContent']
): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    const newNotification: NotificationMessage = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        message,
        read: false,
        createdAt: Date.now(), // Using client timestamp for sorting simplicity
        type,
        deliveryMethod,
        emailContent,
    };
    
    const updatedNotifications = [newNotification, ...(userData.notifications || [])];
    await updateDoc(userDocRef, { notifications: updatedNotifications });

    // In a real application, a Cloud Function would listen to changes on the `users`
    // collection and trigger the email/SMS sending.
};

export const markNotificationsAsRead = async (userId: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return null;

    const userData = userSnap.data() as User;
    const updatedNotifications = userData.notifications.map(n => ({ ...n, read: true }));
    
    await updateDoc(userDocRef, { notifications: updatedNotifications });

    return { ...userData, notifications: updatedNotifications };
};

export const findAdminByDepartment = async (department: Department): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, 
        where("isAdmin", "==", true), 
        where("department", "==", department)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
    }
    return null;
};

// FIX: Added missing verifyMainAdminPasskey function used by the AdminPasskey component to resolve an import error.
export const verifyMainAdminPasskey = (passkey: string): boolean => {
    return passkey === SUPER_ADMIN_PASSKEY;
};