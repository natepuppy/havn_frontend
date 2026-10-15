export type ApiResponse<T> = {
  data: T;
  data_keys: Record<string, unknown>;
  errors: string[];
  markets?: string[];
};

export type PermissionMap = {
  view_reps: boolean;
  view_all_reps: boolean;
  manage_reps: boolean;
  manage_documents: boolean;
  manage_users: boolean;
  manage_permissions: boolean;
};

export type AppUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  role: string;
  role_id: number;
  managed_team_ids?: number[];
  deleted_at?: number | null;
  permissions?: PermissionMap;
};

export type Role = {
  id: number;
  name: string;
  code: string;
};

export type Team = {
  id: number;
  name: string;
};

export type Permission = {
  id: number;
  role_id: number | null;
  user_id: number | null;
  action: string;
  allowed: boolean;
  description: string;
};

export type OnboardingDocument = {
  id: number;
  name: string;
  description: string | null;
  body: string;
  active: boolean;
  send_by_default: boolean;
  required: boolean;
  position: number;
};

export type RecruitingNode = {
  key: string;
  user_id: number | null;
  rep_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  market: string | null;
  visible: boolean;
  children: RecruitingNode[];
};

export type Market = {
  id: number;
  name: string;
};

export type DocumentDelivery = {
  id: number;
  rep_id: number;
  onboarding_document_id: number;
  document_name: string;
  recipient_email: string;
  status: "queued" | "sent" | "failed";
  sent_at: number | string | null;
  error_message: string | null;
};

export type Rep = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  start_date: string;
  end_date: string | null;
  shirt_size: string | null;
  drivers_license_number: string | null;
  market: string | null;
  level: string | null;
  housing: string | null;
  notes: string | null;
  status: "pending" | "docs_sent";
  active: boolean;
  onboarding_completed: boolean;
  agreement_completed: boolean;
  role: string | null;
  recruited_by_id: number;
  recruiter_name: string;
  recruiter_email: string;
  documents_sent_count: number;
  deliveries: DocumentDelivery[];
};

export type NewRepInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  start_date: string;
  end_date?: string;
  shirt_size: string;
  drivers_license_number: string;
  market?: string;
  level: "Rookie" | "Veteran" | "Pro";
  housing: "Single housing" | "Married housing";
  notes?: string;
  recruited_by_id: number;
  document_ids: number[];
};
