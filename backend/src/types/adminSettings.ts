export interface AdminSettingsPayload {
  company_name?: string;
  company_logo?: string;
  currency?: string;
  distance_unit?: string;
  fuel_unit?: string;
  timezone?: string;
  language?: string;
  fuel_price_provider?: string;
  theme?: string;
  notification_preferences?: Record<string, boolean>;
  email_settings?: Record<string, unknown>;
  role_permissions?: Record<string, string[]>;
  application_version?: string;
}
