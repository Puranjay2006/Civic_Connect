import { User, NotificationMessage, Department, NotificationType } from '../types';

const USERS_KEY = 'civic-users';
const SESSION_KEY = 'civic-session';
const ADMIN_PASSKEY = 'ykls_764'; // Super Admin

// Department Admin Passkeys
const DEPARTMENT_PASSKEYS: { [key in Department]?: string } = {
    [Department.Electrical]: 'elec_123',
    [Department.Water]: 'water_456',
    [Department.Medical]: 'med_789',
    [Department.Sanitation]: 'sani_101',
    [Department.Roads]: 'roads_112',
};

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

export const signUp = (username: string, email: string, password: string, department?: Department): User | null => {
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
    isAdmin: email.toLowerCase().includes('@city.gov'), // Make all city.gov admins
    notifications: [],
    department: department,
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
    const users = getUsers();
    
    // Super Admin
    if (passkey === ADMIN_PASSKEY) {
        let adminUser = users.find(u => u.email.toLowerCase() === 'admin@city.gov');
        if (!adminUser) {
            console.log("Super admin user not found, creating one.");
            adminUser = signUp('admin', 'admin@city.gov', 'default_admin_password_placeholder');
            if (!adminUser) throw new Error('Could not create super admin user.');
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
        return adminUser;
    }

    // Department Admin
    for (const dept in DEPARTMENT_PASSKEYS) {
        if (DEPARTMENT_PASSKEYS[dept as Department] === passkey) {
            const department = dept as Department;
            const deptEmail = `${department.toLowerCase()}@city.gov`;
            let deptAdmin = users.find(u => u.email.toLowerCase() === deptEmail);

            if (!deptAdmin) {
                console.log(`Department admin for ${department} not found, creating one.`);
                deptAdmin = signUp(department, deptEmail, 'default_dept_password', department);
                if (!deptAdmin) throw new Error(`Could not create admin for ${department}.`);
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(deptAdmin));
            return deptAdmin;
        }
    }

    throw new Error('Invalid Admin Passkey.');
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


export const addNotification = (userId: string, message: string, type: NotificationType): void => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    const newNotification: NotificationMessage = {
        id: `notif-${Date.now()}`,
        message,
        read: false,
        createdAt: Date.now(),
        type,
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

export const findAdminByDepartment = (department: Department): User | null => {
    const users = getUsers();
    const deptEmail = `${department.toLowerCase()}@city.gov`;
    return users.find(u => u.isAdmin && u.email.toLowerCase() === deptEmail) || null;
}