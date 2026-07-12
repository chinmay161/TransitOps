export interface NotificationCenterData {
  unread_count: number;
  types: string[];
  history: Array<{
    id: string;
    user_id?: string;
    title: string;
    message: string;
    status: string;
    notification_type: string;
    entity_type?: string | null;
    entity_id?: string | null;
    read_at?: string | null;
    created_at: string;
  }>;
  maintenance_due: Array<Record<string, string>>;
  maintenance_completed: Array<Record<string, string>>;
  insurance_expiring: Array<Record<string, string>>;
  license_expiring: Array<Record<string, string>>;
  trip_delayed: Array<Record<string, string>>;
  trip_completed: Array<Record<string, string>>;
  vehicle_offline: Array<Record<string, string>>;
}
