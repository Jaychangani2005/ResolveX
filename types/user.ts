export type UserRole = 'user' | 'admin' | 'super_user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points: number;
  badge: string;
  badgeEmoji: string;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  permissions: string[];
  profileImage?: string;
  phoneNumber?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: [
    'manage_users',
    'view_reports',
    'approve_reports',
    'manage_leaderboard',
    'view_analytics'
  ];
}

export interface SuperUser extends User {
  role: 'super_user';
  permissions: [
    'manage_users',
    'manage_admins',
    'view_reports',
    'approve_reports',
    'reject_reports',
    'manage_leaderboard',
    'view_analytics',
    'system_settings',
    'delete_users',
    'ban_users'
  ];
}

export interface NormalUser extends User {
  role: 'user';
  permissions: [
    'submit_reports',
    'view_own_reports',
    'view_leaderboard'
  ];
}

export interface IncidentReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  photoUrl: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    fullAddress?: string;
  };
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
} 