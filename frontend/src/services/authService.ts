import { User, NotificationMessage, Department, NotificationType } from '../types';
import { SUPER_ADMIN_PASSKEY, DEPARTMENT_PASSKEYS } from '../constants';

const USERS_KEY = 'civic-users';
const SESSION_KEY = 'civic-session';

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
    isAdmin: email.toLowerCase().includes('@city.gov'),
    notifications: [],
    department: department,
    createdAt: Date.now(),
  };

  saveUsers([...users, newUser]);
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
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
    adminUser = signUp('SuperAdmin', 'admin@city.gov', 'default_admin_password_placeholder');
    if (!adminUser) throw new Error('Could not create super admin user.');
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
  return adminUser;
};

export const loginAsDepartmentAdmin = (department: Department, passkey: string): User => {
  if (DEPARTMENT_PASSKEYS[department] !== passkey) {
    throw new Error('Invalid Passkey for this department.');
  }
  
  const users = getUsers();
  const deptEmail = `${department.toLowerCase()}@city.gov`;
  let deptAdmin = users.find(u => u.email.toLowerCase() === deptEmail);

  if (!deptAdmin) {
    deptAdmin = signUp(department, deptEmail, 'default_dept_password', department);
    if (!deptAdmin) throw new Error(`Could not create admin for ${department}.`);
  }
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(deptAdmin));
  return deptAdmin;
};

export const verifyMainAdminPasskey = (passkey: string): boolean => {
  return passkey === SUPER_ADMIN_PASSKEY;
};

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
    
    const resetLink = `/reset-password/${token}`;
    const emailContent = {
      subject: "Your Password Reset Request",
      body: `Hello ${users[userIndex].username},\n\nA password reset was requested for your Civic Connect account. If you did not make this request, you can safely ignore this email.\n\nTo reset your password, please click the button below. This link will expire in one hour.`,
      cta: { text: 'Reset Your Password', link: resetLink }
    };

    addNotification(users[userIndex].id, 'A password reset was requested for your account.', NotificationType.PasswordReset, 'email', emailContent);
  }
};

export const resetPassword = (token: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(
    u => u.passwordResetToken === token && u.passwordResetExpires && u.passwordResetExpires > Date.now()
  );

  if (userIndex === -1) {
    throw new Error('Invalid or expired password reset token.');
  }

  users[userIndex].passwordHash = pseudoHash(newPassword);
  users[userIndex].passwordResetToken = undefined;
  users[userIndex].passwordResetExpires = undefined;
  saveUsers(users);

  addNotification(users[userIndex].id, 'Your password has been successfully reset.', NotificationType.General);
  return true;
};

export const addNotification = (
  userId: string,
  message: string,
  type: NotificationType,
  deliveryMethod: 'in-app' | 'email' = 'in-app',
  emailContent?: { subject: string; body: string; cta?: { text: string; link: string } }
): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return;

  const notification: NotificationMessage = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    message,
    read: false,
    createdAt: Date.now(),
    type,
    deliveryMethod,
    emailContent,
  };

  users[userIndex].notifications = [notification, ...users[userIndex].notifications];
  saveUsers(users);

  // Dispatch event for real-time updates
  if (deliveryMethod === 'email' && emailContent) {
    const emailEvent = new CustomEvent('show-email-sim', {
      detail: {
        ...emailContent,
        recipient: users[userIndex].email,
        user: users[userIndex],
      },
    });
    window.dispatchEvent(emailEvent);
  } else {
    const toastEvent = new CustomEvent('show-toast', {
      detail: { notification, user: users[userIndex] },
    });
    window.dispatchEvent(toastEvent);
  }
};

export const markNotificationAsRead = (userId: string, notificationId: string): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return null;

  const notifIndex = users[userIndex].notifications.findIndex(n => n.id === notificationId);
  if (notifIndex > -1) {
    users[userIndex].notifications[notifIndex].read = true;
    saveUsers(users);
    
    // Update session
    const session = getCurrentUser();
    if (session && session.id === userId) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
    }
  }

  return users[userIndex];
};

export const markAllNotificationsAsRead = (userId: string): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return null;

  users[userIndex].notifications = users[userIndex].notifications.map(n => ({ ...n, read: true }));
  saveUsers(users);
  
  // Update session
  const session = getCurrentUser();
  if (session && session.id === userId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
  }

  return users[userIndex];
};

export const findAdminByDepartment = (department: Department): User | undefined => {
  const users = getUsers();
  return users.find(u => u.isAdmin && u.department === department);
};

export const getAllUsers = (): User[] => {
  return getUsers();
};
