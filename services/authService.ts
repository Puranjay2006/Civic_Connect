import { User, NotificationMessage, Department, NotificationType } from '../types';

const USERS_KEY = 'civic-users';
const SESSION_KEY = 'civic-session';

// New Passkey Structure
const SUPER_ADMIN_PASSKEY = 'ykls_764';
const DEPARTMENT_PASSKEYS: { [key in Department]: string } = {
    [Department.Electrical]: 'ljn_9871',
    [Department.Water]: 'ljn_9872',
    [Department.Medical]: 'ljn_9873',
    [Department.Sanitation]: 'ljn_9874',
    [Department.Roads]: 'ljn_9875',
};

// FIX: Add missing verifyMainAdminPasskey function to resolve an import error in AdminPasskey.tsx.
export const verifyMainAdminPasskey = (passkey: string): boolean => {
  return passkey === SUPER_ADMIN_PASSKEY;
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
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser)); // Create session on sign up
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

export const loginAsSuperAdmin = (passkey: string): User => {
    if (passkey !== SUPER_ADMIN_PASSKEY) {
        throw new Error('Invalid Super Admin Passkey.');
    }
    const users = getUsers();
    let adminUser = users.find(u => u.email.toLowerCase() === 'admin@city.gov');
    if (!adminUser) {
        console.log("Super admin user not found, creating one.");
        adminUser = signUp('admin', 'admin@city.gov', 'default_admin_password_placeholder');
        if (!adminUser) throw new Error('Could not create super admin user.');
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
    return adminUser;
}

export const loginAsDepartmentAdmin = (department: Department, passkey: string): User => {
    if (DEPARTMENT_PASSKEYS[department] !== passkey) {
        throw new Error('Invalid Passkey for this department.');
    }
    
    const users = getUsers();
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

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const sessionJson = localStorage.getItem(SESSION_KEY);
  return sessionJson ? JSON.parse(sessionJson) : null;
};

export const requestPasswordReset = (email: string): void => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex > -1) {
        const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const expires = Date.now() + 3600000; // 1 hour expiry

        users[userIndex].passwordResetToken = token;
        users[userIndex].passwordResetExpires = expires;
        saveUsers(users);
        
        const resetLink = `#reset-password/${token}`;

        // Create a rich simulated email notification
        const emailContent = {
            subject: "Your Password Reset Request",
            body: `Hello ${users[userIndex].username},\n\nA password reset was requested for your Civic Connect account. If you did not make this request, you can safely ignore this email.\n\nTo reset your password, please click the button below. This link will expire in one hour.`,
            cta: { text: 'Reset Your Password', link: resetLink }
        };

        addNotification(users[userIndex].id, 'A password reset was requested for your account.', NotificationType.PasswordReset, 'email', emailContent);
    }
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


export const addNotification = (
    userId: string,
    message: string,
    type: NotificationType,
    deliveryMethod: 'in-app' | 'email' = 'in-app',
    emailContent?: NotificationMessage['emailContent']
): User | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    const newNotification: NotificationMessage = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        message,
        read: false,
        createdAt: Date.now(),
        type,
        deliveryMethod,
        emailContent,
    };
    
    users[userIndex].notifications.unshift(newNotification);
    saveUsers(users);

    const updatedTargetUser = users[userIndex];
    const currentUser = getCurrentUser();

    // Dispatch the email simulation event ONLY if it's for the current user,
    // OR if it's a password reset for a logged-out user.
    if (deliveryMethod === 'email') {
        const isForCurrentUser = currentUser && currentUser.id === userId;
        const isPasswordResetForGuest = !currentUser && type === NotificationType.PasswordReset;

        if (isForCurrentUser || isPasswordResetForGuest) {
            const event = new CustomEvent('show-email-sim', {
                detail: {
                    ...emailContent,
                    recipient: updatedTargetUser.email,
                    // Only include the user object if it's for the current user.
                    user: isForCurrentUser ? updatedTargetUser : undefined,
                },
            });
            window.dispatchEvent(event);
        }
    }

    // If the notification is for the currently logged-in user, update their session
    // and dispatch a toast for in-app notifications.
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedTargetUser));

        if (deliveryMethod === 'in-app') {
            const event = new CustomEvent('show-toast', {
                detail: { notification: newNotification, user: updatedTargetUser },
            });
            window.dispatchEvent(event);
        }
        return updatedTargetUser;
    }

    // For notifications to other users, the 'storage' event listener in App.tsx handles updates.
    return null;
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