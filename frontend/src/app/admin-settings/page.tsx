"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModuleShell } from "@/components/app/ModuleShell";
import { adminSettingsService } from "@/lib/admin-settings.service";
import { AdminSettings, AdminSettingsUpdateInput } from "@/types/admin-settings";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState<string>("");
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [notificationText, setNotificationText] = useState("{}");
  const [emailText, setEmailText] = useState("{}");
  const [roleText, setRoleText] = useState("{}");
  const { register, handleSubmit, reset } = useForm<AdminSettingsUpdateInput>();

  useEffect(() => {
    void adminSettingsService.get().then((settings: AdminSettings) => {
      setSettings(settings);
      setNotificationText(JSON.stringify(settings.notification_preferences, null, 2));
      setEmailText(JSON.stringify(settings.email_settings, null, 2));
      setRoleText(JSON.stringify(settings.role_permissions, null, 2));
      reset({
        company_name: settings.company_name,
        company_logo: settings.company_logo || "",
        currency: settings.currency,
        distance_unit: settings.distance_unit,
        fuel_unit: settings.fuel_unit,
        timezone: settings.timezone,
        language: settings.language,
        fuel_price_provider: settings.fuel_price_provider,
        theme: settings.theme,
        application_version: settings.application_version,
      });
    });
  }, [reset]);

  return (
    <ModuleShell title="Admin Settings">
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
        {saved ? <div className="mb-4 text-emerald-300">{saved}</div> : null}
        <form
          onSubmit={handleSubmit(async (values) => {
            const updated = await adminSettingsService.update({
              ...values,
              notification_preferences: JSON.parse(notificationText),
              email_settings: JSON.parse(emailText),
              role_permissions: JSON.parse(roleText),
            });
            setSettings(updated);
            setSaved("Settings saved successfully.");
          })}
          className="grid gap-4 md:grid-cols-2"
        >
          <input {...register("company_name")} placeholder="Company Name" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("company_logo")} placeholder="Company Logo URL" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("currency")} placeholder="Currency" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("distance_unit")} placeholder="Distance Unit" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("fuel_unit")} placeholder="Fuel Unit" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("timezone")} placeholder="Timezone" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("language")} placeholder="Language" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("fuel_price_provider")} placeholder="Fuel Price Provider" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("theme")} placeholder="Theme" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("application_version")} placeholder="Application Version" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-[#7F93B7]">Notification Preferences JSON</span>
            <textarea value={notificationText} onChange={(event) => setNotificationText(event.target.value)} className="min-h-36 w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 font-mono text-sm" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-[#7F93B7]">Email Settings JSON</span>
            <textarea value={emailText} onChange={(event) => setEmailText(event.target.value)} className="min-h-36 w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 font-mono text-sm" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-[#7F93B7]">Role Permissions JSON</span>
            <textarea value={roleText} onChange={(event) => setRoleText(event.target.value)} className="min-h-36 w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 font-mono text-sm" />
          </label>
          <button type="submit" className="btn-primary md:col-span-2">
            Save Settings
          </button>
        </form>
      </section>
      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <h2 className="mb-4 text-xl font-bold">Audit Logs</h2>
        <div className="grid gap-3">
          {settings?.audit_logs.map((log) => (
            <div key={log.id} className="border-b border-white/8 pb-3 text-sm">
              <div className="font-semibold">{log.action_name} / {log.entity_type}</div>
              <div className="text-[#7F93B7]">{log.module_name} / {log.created_at}</div>
            </div>
          ))}
        </div>
      </section>
    </ModuleShell>
  );
}
