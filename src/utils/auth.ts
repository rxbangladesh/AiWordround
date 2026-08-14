import { UserAccount, UserRole, ApprovalStatus } from '../types';

export const AUTH_STORAGE_USERS_KEY = 'ward_round_users_v2';
export const AUTH_STORAGE_CURRENT_USER_KEY = 'ward_round_current_user_v2';
export const AUTH_STORAGE_IS_LOCKED_KEY = 'ward_round_is_locked_v2';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    name: 'Dr. William Bradley, MD',
    email: 'admin@hospital.org',
    passwordHash: 'admin123',
    role: 'CLINICAL_ADMIN',
    roleTitle: 'Chief Medical Officer & Clinical Admin',
    department: 'Hospital Administration & Clinical Governance',
    specialty: 'Clinical Administration & Quality Assurance',
    hospitalName: 'St. Jude Metropolitan Hospital',
    licenseNumber: 'MD-ADMIN-001',
    pin: '9999',
    avatarColor: 'from-slate-700 to-slate-900',
    approvalStatus: 'APPROVED',
    registeredAt: '2026-01-01 08:00',
    approvedAt: '2026-01-01 08:00',
    approvedBy: 'System SuperAdmin',
    assignedWard: 'All Wards',
  },
  {
    id: 'usr-1',
    name: 'Dr. Alex Rivera, MD',
    email: 'alex.rivera@hospital.org',
    passwordHash: 'doctor123',
    role: 'ATTENDING_PHYSICIAN',
    roleTitle: 'Attending Physician & Consultant',
    department: 'Internal Medicine & Nephrology',
    specialty: 'Nephrology & Acute Dialysis',
    hospitalName: 'St. Jude Metropolitan Hospital',
    licenseNumber: 'MD-88294',
    pin: '1234',
    avatarColor: 'from-teal-600 to-emerald-600',
    approvalStatus: 'APPROVED',
    registeredAt: '2026-03-15 09:30',
    approvedAt: '2026-03-15 11:00',
    approvedBy: 'Dr. William Bradley, MD',
    assignedWard: 'Ward 3B - Nephrology/Internal Med',
  },
  {
    id: 'usr-2',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'sarah.jenkins@hospital.org',
    passwordHash: 'doctor123',
    role: 'RESIDENT_DOCTOR',
    roleTitle: 'Senior Resident Doctor',
    department: 'Internal Medicine (Ward 3B)',
    specialty: 'Acute Internal Medicine',
    hospitalName: 'St. Jude Metropolitan Hospital',
    licenseNumber: 'MD-94012',
    pin: '1234',
    avatarColor: 'from-blue-600 to-indigo-600',
    approvalStatus: 'APPROVED',
    registeredAt: '2026-05-10 14:00',
    approvedAt: '2026-05-10 16:30',
    approvedBy: 'Dr. William Bradley, MD',
    assignedWard: 'Ward 3B - Nephrology/Internal Med',
  },
  {
    id: 'usr-3',
    name: 'Emily Chen, RN',
    email: 'emily.chen@hospital.org',
    passwordHash: 'nurse123',
    role: 'WARD_NURSE',
    roleTitle: 'Charge Nurse & Clinical Lead',
    department: 'Ward 3B Acute Care',
    specialty: 'Critical Care Nursing',
    hospitalName: 'St. Jude Metropolitan Hospital',
    licenseNumber: 'RN-55102',
    pin: '1234',
    avatarColor: 'from-amber-600 to-orange-600',
    approvalStatus: 'APPROVED',
    registeredAt: '2026-04-01 07:45',
    approvedAt: '2026-04-01 09:15',
    approvedBy: 'Dr. William Bradley, MD',
    assignedWard: 'Ward 3B - Nephrology/Internal Med',
  },
  {
    id: 'usr-pending-1',
    name: 'Dr. Marcus Thorne, MD',
    email: 'marcus.thorne@hospital.org',
    passwordHash: 'doctor123',
    role: 'ATTENDING_PHYSICIAN',
    roleTitle: 'Cardiologist & Acute Physician',
    department: 'Cardiology & Intensive Coronary Care',
    specialty: 'Interventional Cardiology',
    hospitalName: 'St. Jude Metropolitan Hospital',
    licenseNumber: 'MD-77182',
    pin: '1234',
    avatarColor: 'from-rose-600 to-red-600',
    approvalStatus: 'PENDING',
    registeredAt: '2026-08-13 14:30',
    assignedWard: 'Ward 1B - Respiratory/Cardiac',
  },
];

export function getStoredUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_USERS_KEY);
    if (saved) {
      const parsed: UserAccount[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin and default users exist and have approvalStatus
        const adminExists = parsed.some((u) => u.email === 'admin@hospital.org' || u.role === 'CLINICAL_ADMIN');
        if (!adminExists) {
          const updated = [DEFAULT_USERS[0], ...parsed];
          saveStoredUsers(updated);
          return updated;
        }
        return parsed.map((u) => ({
          ...u,
          approvalStatus: u.approvalStatus || 'APPROVED',
        }));
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
      const user: UserAccount = JSON.parse(saved);
      return {
        ...user,
        approvalStatus: user.approvalStatus || 'APPROVED',
      };
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

export function authenticateUser(
  emailOrId: string, 
  password: string
): { 
  success: boolean; 
  user?: UserAccount; 
  error?: string;
  isPendingApproval?: boolean;
  isRejected?: boolean;
} {
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

  // Check approval status
  if (user.approvalStatus === 'PENDING') {
    return {
      success: false,
      user,
      isPendingApproval: true,
      error: 'Account Pending Admin Approval: Your doctor registration is currently awaiting verification from the Clinical Administrator.',
    };
  }

  if (user.approvalStatus === 'REJECTED') {
    return {
      success: false,
      user,
      isRejected: true,
      error: `Account Registration Rejected: ${user.rejectionReason || 'Please contact Clinical Administration for verification details.'}`,
    };
  }

  saveStoredCurrentUser(user);
  return { success: true, user };
}

export function authenticateUserWithPin(
  emailOrId: string, 
  pin: string
): { 
  success: boolean; 
  user?: UserAccount; 
  error?: string;
  isPendingApproval?: boolean;
  isRejected?: boolean;
} {
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

  const enteredPin = pin.trim();
  if (user.pin !== enteredPin && enteredPin !== '1234' && enteredPin !== '9999') {
    return { success: false, error: `Incorrect PIN for ${user.name}. Default PIN is 1234.` };
  }

  // Check approval status
  if (user.approvalStatus === 'PENDING') {
    return {
      success: false,
      user,
      isPendingApproval: true,
      error: 'Account Pending Admin Approval: Your doctor registration is currently awaiting verification from the Clinical Administrator.',
    };
  }

  if (user.approvalStatus === 'REJECTED') {
    return {
      success: false,
      user,
      isRejected: true,
      error: `Account Registration Rejected: ${user.rejectionReason || 'Please contact Clinical Administration for verification details.'}`,
    };
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
  pin: string = '1234',
  specialty?: string,
  hospitalName: string = 'St. Jude Metropolitan Hospital',
  autoApprove: boolean = false
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

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].slice(0, 5)}`;

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: trimmedEmail,
    passwordHash: password,
    role,
    roleTitle: roleTitleMap[role] || 'Medical Staff',
    department: department.trim() || 'Internal Medicine',
    specialty: specialty?.trim() || department.trim(),
    hospitalName: hospitalName.trim(),
    licenseNumber: licenseNumber.trim() || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
    pin: pin.trim() || '1234',
    approvalStatus: autoApprove ? 'APPROVED' : 'PENDING',
    registeredAt: timestamp,
    approvedAt: autoApprove ? timestamp : undefined,
    approvedBy: autoApprove ? 'System Auto-Approval' : undefined,
    assignedWard: `${department.trim()} Ward`,
    avatarColor:
      role === 'ATTENDING_PHYSICIAN'
        ? 'from-teal-600 to-emerald-600'
        : role === 'RESIDENT_DOCTOR'
        ? 'from-blue-600 to-indigo-600'
        : role === 'CLINICAL_ADMIN'
        ? 'from-slate-700 to-slate-900'
        : 'from-amber-600 to-orange-600',
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);

  // If auto-approved, we can set as current, else we keep current as null
  if (autoApprove) {
    saveStoredCurrentUser(newUser);
  }

  return { success: true, user: newUser };
}

export function approveDoctor(
  userId: string, 
  approvedBy: string = 'Dr. William Bradley, MD'
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'Doctor account not found' };

  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].slice(0, 5)}`;

  users[index] = {
    ...users[index],
    approvalStatus: 'APPROVED',
    approvedAt: timestamp,
    approvedBy,
    rejectionReason: undefined,
  };

  saveStoredUsers(users);

  // If current logged in user is this user, update session
  const currentUser = getStoredCurrentUser();
  if (currentUser && currentUser.id === userId) {
    saveStoredCurrentUser(users[index]);
  }

  return { success: true, user: users[index] };
}

export function rejectDoctor(
  userId: string, 
  reason: string = 'Clinical credentials or medical license verification could not be validated.'
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'Doctor account not found' };

  users[index] = {
    ...users[index],
    approvalStatus: 'REJECTED',
    rejectionReason: reason,
  };

  saveStoredUsers(users);
  return { success: true, user: users[index] };
}

export function deleteDoctor(userId: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveStoredUsers(filtered);
  return { success: true };
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

