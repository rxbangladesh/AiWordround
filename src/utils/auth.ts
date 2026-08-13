import { UserAccount, UserRole } from '../types';

export const AUTH_STORAGE_USERS_KEY = 'ward_round_users_v1';
export const AUTH_STORAGE_CURRENT_USER_KEY = 'ward_round_current_user_v1';
export const AUTH_STORAGE_IS_LOCKED_KEY = 'ward_round_is_locked_v1';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Dr. Alex Rivera, MD',
    email: 'alex.rivera@hospital.org',
    passwordHash: 'doctor123',
    role: 'ATTENDING_PHYSICIAN',
    roleTitle: 'Attending Physician & Consultant',
    department: 'Internal Medicine & Nephrology',
    licenseNumber: 'MD-88294',
    pin: '1234',
    avatarColor: 'from-teal-600 to-emerald-600',
  },
  {
    id: 'usr-2',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'sarah.jenkins@hospital.org',
    passwordHash: 'doctor123',
    role: 'RESIDENT_DOCTOR',
    roleTitle: 'Senior Resident Doctor',
    department: 'Internal Medicine (Ward 3B)',
    licenseNumber: 'MD-94012',
    pin: '1234',
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'usr-3',
    name: 'Emily Chen, RN',
    email: 'emily.chen@hospital.org',
    passwordHash: 'nurse123',
    role: 'WARD_NURSE',
    roleTitle: 'Charge Nurse & Clinical Lead',
    department: 'Ward 3B Acute Care',
    licenseNumber: 'RN-55102',
    pin: '1234',
    avatarColor: 'from-amber-600 to-orange-600',
  },
];

export function getStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load users from localStorage:', err);
  }
  // Initialize with defaults
  saveStoredUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(AUTH_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to save users to localStorage:', err);
  }
}

export function getStoredCurrentUser(): UserAccount | null {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_CURRENT_USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to load current user from localStorage:', err);
  }
  return null;
}

export function saveStoredCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_CURRENT_USER_KEY);
    }
  } catch (err) {
    console.warn('Failed to save current user to localStorage:', err);
  }
}

export function authenticateUser(emailOrId: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const trimmedInput = emailOrId.trim().toLowerCase();
  
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === trimmedInput ||
      u.name.toLowerCase() === trimmedInput ||
      (u.licenseNumber && u.licenseNumber.toLowerCase() === trimmedInput)
  );

  if (!user) {
    return { success: false, error: 'No clinical account found with this email or license ID.' };
  }

  if (user.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Please verify your credentials or use a demo account.' };
  }

  saveStoredCurrentUser(user);
  return { success: true, user };
}

export function registerNewUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  department: string,
  licenseNumber: string,
  pin: string = '1234'
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const trimmedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const roleTitleMap: Record<UserRole, string> = {
    ATTENDING_PHYSICIAN: 'Attending Physician & Consultant',
    RESIDENT_DOCTOR: 'Resident Medical Officer',
    WARD_NURSE: 'Ward Staff Nurse',
    CLINICAL_ADMIN: 'Clinical System Administrator',
  };

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: trimmedEmail,
    passwordHash: password,
    role,
    roleTitle: roleTitleMap[role] || 'Medical Staff',
    department: department.trim() || 'General Medicine',
    licenseNumber: licenseNumber.trim() || `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
    pin: pin.trim() || '1234',
    avatarColor:
      role === 'ATTENDING_PHYSICIAN'
        ? 'from-teal-600 to-emerald-600'
        : role === 'RESIDENT_DOCTOR'
        ? 'from-blue-600 to-indigo-600'
        : 'from-purple-600 to-pink-600',
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  saveStoredCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function updatePassword(userId: string, oldPass: string, newPass: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'User account not found' };

  if (users[index].passwordHash !== oldPass) {
    return { success: false, error: 'Current password does not match.' };
  }

  users[index].passwordHash = newPass;
  saveStoredUsers(users);
  saveStoredCurrentUser(users[index]);
  return { success: true };
}

export function updatePin(userId: string, newPin: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'User account not found' };

  users[index].pin = newPin;
  saveStoredUsers(users);
  saveStoredCurrentUser(users[index]);
  return { success: true };
}
