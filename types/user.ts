export type UserRole = 'coastal_communities' | 'conservation_ngos' | 'government_forestry' | 'researchers' | 'admin';

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
  profileImage: string;
  phoneNumber: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  preferences: {
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
    'view_analytics',
    'system_settings'
  ];
}

export interface CoastalCommunitiesUser extends User {
  role: 'coastal_communities';
  permissions: [
    'submit_reports',
    'view_own_reports',
    'view_leaderboard',
    'view_community_reports'
  ];
}

export interface ConservationNGOsUser extends User {
  role: 'conservation_ngos';
  permissions: [
    'view_incident_pictures',
    'view_incident_descriptions',
    'view_user_names',
    'view_ai_validation_status',
    'view_incident_reports',
    'view_analytics',
    'submit_reports'
  ];
}

export interface GovernmentForestryUser extends User {
  role: 'government_forestry';
  permissions: [
    'view_incident_pictures',
    'view_incident_descriptions',
    'view_user_names',
    'view_ai_validation_status',
    'view_incident_reports',
    'view_analytics',
    'approve_reports',
    'manage_reports',
    'submit_reports'
  ];
}

export interface ResearchersUser extends User {
  role: 'researchers';
  permissions: [
    'view_incident_pictures',
    'view_incident_descriptions',
    'view_user_names',
    'view_ai_validation_status',
    'view_incident_reports',
    'view_analytics',
    'export_data',
    'submit_reports',
    'view_research_data'
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
  aiValidated?: boolean; // AI validation status
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminNotes?: string;
}

 