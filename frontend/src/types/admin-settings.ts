export interface AdminSettings {
  id: string;
  company_name: string;
  company_logo: string | null;
  currency: string;
  distance_unit: string;
  fuel_unit: string;
  timezone: string;
  language: string;
  fuel_price_provider: string;
  theme: string;
  notification_preferences: Record<string, boolean>;
  email_settings: Record<string, unknown>;
  role_permissions: Record<string, string[]>;
  application_version: string;
  audit_logs: AuditLogEntry[];
  created_at: string;
  updated_at: string;
}

export interface AdminSettingsUpdateInput {
  company_name: string;
  company_logo?: string;
  currency: string;
  distance_unit: string;
  fuel_unit: string;
  timezone: string;
  language?: string;
  fuel_price_provider: string;
  theme: string;
  notification_preferences?: Record<string, boolean>;
  email_settings?: Record<string, unknown>;
  role_permissions?: Record<string, string[]>;
  application_version: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  module_name: string;
  entity_type: string;
  entity_id: string | null;
  action_name: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}
