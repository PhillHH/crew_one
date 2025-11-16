export type IntakeRole = 'user' | 'assistant';

export interface IntakeTurn {
  role: IntakeRole;
  content: string;
}

export type ExperienceLevel = 'beginner' | 'experienced' | 'professional';

export interface SupportOptions {
  phone_support?: boolean;
  onsite_support?: boolean;
  location?: string | null;
}

export interface DeliveryOptions {
  download: boolean;
  email: boolean;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DIYRequirementDraft {
  project_goal?: string;
  current_state?: string;
  dimensions?: string;
  surface_details?: string;
  materials?: string[];
  finish_preference?: string;
  environment?: string;
  indoor_outdoor?: string;
  style_reference?: string;
  tools_available?: string[];
  skill_level?: ExperienceLevel;
  experience_notes?: string;
  budget?: string;
  timeline?: string;
  special_considerations?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  delivery_download?: boolean;
  delivery_email?: boolean;
  support_phone?: boolean;
  support_onsite?: boolean;
  support_location?: string;
}

export interface DIYRequirement {
  project_goal: string;
  current_state?: string | null;
  dimensions: string;
  surface_details?: string | null;
  materials: string[];
  finish_preference?: string | null;
  environment: string;
  indoor_outdoor: string;
  style_reference?: string | null;
  tools_available: string[];
  skill_level: ExperienceLevel;
  experience_notes?: string | null;
  budget?: string | null;
  timeline?: string | null;
  special_considerations?: string | null;
  contact: ContactInfo;
  delivery_options: DeliveryOptions;
  support_options?: SupportOptions | null;
}

export interface DIYResponse {
  success: boolean;
  message: string;
  pdf_url?: string | null;
  file_id?: string | null;
  support_request_id?: string | null;
  email_sent: boolean;
}

export interface IntakeChatStatus {
  is_complete?: boolean;
  missing_fields?: string[];
  message?: string;
  requirement?: DIYRequirement;
}

export interface IntakeChatPayload {
  history: IntakeTurn[];
  requirement_snapshot?: DIYRequirementDraft;
}

export interface IntakeFinalizeResponse {
  requirement: DIYRequirement;
  result: DIYResponse;
}

export interface IntakeResult {
  requirement: DIYRequirement;
  response: DIYResponse;
}

