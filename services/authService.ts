import { User, NotificationMessage } from '../types';

const USERS_KEY = 'civic-users';
const SESSION_KEY = 'civic-session';
const ADMIN_PASSKEY = 'ykls_764'; // Developer-provided passkey

// Helper to get users from localStorage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Simulate a secure password hash
const pseudoHash = (password: string): string => {
  return `hashed_${password}_salted`;
};

export const signUp = (username: string, email: string, password: string): User | null => {
  const users = getUsers();
  
  // Username validation
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
  }
  const existingUserByUsername = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUserByUsername) {
    throw new Error('This username is already taken.');
  }

  // Email validation
  const existingUserByEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUserByEmail) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username: username,
    email: email.toLowerCase(),
    passwordHash: pseudoHash(password),
    isAdmin: email.toLowerCase() === 'admin@city.gov', // Hardcoded admin user
    notifications: [],
  };

  saveUsers([...users, newUser]);
  return newUser;
};

export const login = (identifier: string, password: string): User | null => {
  const users = getUsers();
  const lowercasedIdentifier = identifier.toLowerCase();
  const user = users.find(u => 
    u.email.toLowerCase() === lowercasedIdentifier || 
    u.username.toLowerCase() === lowercasedIdentifier
  );

  if (user && user.passwordHash === pseudoHash(password)) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  throw new Error('Invalid credentials.');
};

export const loginWithPasskey = (passkey: string): User | null => {
    if (passkey !== ADMIN_PASSKEY) {
        throw new Error('Invalid Admin Passkey.');
    }

    const users = getUsers();
    let adminUser = users.find(u => u.email.toLowerCase() === 'admin@city.gov');

    // Create admin if it doesn't exist on first passkey login
    if (!adminUser) {
        console.log("Admin user not found, creating one with a default password.");
        adminUser = signUp('admin', 'admin@city.gov', 'default_admin_password_placeholder');
        if (!adminUser) {
             throw new Error('Could not create admin user.');
        }
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
    return adminUser;
}

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const sessionJson = localStorage.getItem(SESSION_KEY);
  return sessionJson ? JSON.parse(sessionJson) : null;
};

export const requestPasswordReset = (email: string): string | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex > -1) {
        const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const expires = Date.now() + 3600000; // 1 hour expiry

        users[userIndex].passwordResetToken = token;
        users[userIndex].passwordResetExpires = expires;
        saveUsers(users);
        
        console.log(`Password reset requested for ${email}. Token: ${token}`);
        return token;
    }
    
    // For security, do not reveal if the user exists or not.
    console.log(`Password reset requested for non-existing user: ${email}. No action taken.`);
    return null;
};

export const resetPassword = (token: string, newPassword: string): void => {
    const users = getUsers();
    const userIndex = users.findIndex(
      u => u.passwordResetToken === token && u.passwordResetExpires && u.passwordResetExpires > Date.now()
    );

    if (userIndex === -1) {
        throw new Error('Invalid or expired password reset token.');
    }

    users[userIndex].passwordHash = pseudoHash(newPassword);
    delete users[userIndex].passwordResetToken;
    delete users[userIndex].passwordResetExpires;
    saveUsers(users);
};


export const addNotification = (userId: string, message: string): void => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const newNotification: NotificationMessage = {
        id: `notif-${Date.now()}`,
        message,
        read: false,
        createdAt: Date.now(),
    };
    
    users[userIndex].notifications.unshift(newNotification);
    saveUsers(users);

    // Update current session if the notification is for the logged-in user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        currentUser.notifications.unshift(newNotification);
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    }
};

export const markNotificationsAsRead = (userId: string): User | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    users[userIndex].notifications.forEach(n => n.read = true);
    saveUsers(users);

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        currentUser.notifications.forEach(n => n.read = true);
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        return currentUser;
    }
    return null;
};