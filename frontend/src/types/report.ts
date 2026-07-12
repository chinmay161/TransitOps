export interface ReportChartDatum {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface GeneratedReport {
  report_type: string;
  report_name: string;
  generated_at: string;
  filters: Record<string, string | undefined>;
  details: Array<Record<string, unknown>>;
  summary: Record<string, number | string>;
  analytics: Record<string, ReportChartDatum[]>;
  insights: Record<string, string | number>;
}

export interface ReportHistoryRecord {
  id: string;
  report_type: string;
  report_name: string;
  filters: Record<string, string>;
  format: string;
  is_favorite: boolean;
  generated_at: string;
  generated_by: string | null;
}
