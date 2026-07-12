"use client";

import { useEffect, useState } from "react";
import { ModuleShell } from "@/components/app/ModuleShell";
import { notificationService } from "@/lib/notification.service";
import { NotificationCenterData } from "@/types/notification-center";

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationCenterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    void notificationService.list().then(setData).catch((err: Error) => setError(err.message));
  };

  useEffect(load, []);

  return (
    <ModuleShell
      title="Notification Center"
      actions={
        <button className="btn-primary" onClick={() => void notificationService.markAllAsRead().then(load)}>
          Mark All Read
        </button>
      }
    >
      {error ? <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6 text-red-300">{error}</section> : null}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[#7F93B7]">Unread Count</div>
          <div className="mt-3 text-3xl font-black">{data?.unread_count ?? 0}</div>
        </div>
        <div className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[#7F93B7]">Types</div>
          <div className="mt-3 text-3xl font-black">{data?.types.length ?? 0}</div>
        </div>
      </section>
      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <h2 className="mb-4 text-xl font-bold">Inbox</h2>
        <div className="grid gap-3">
          {data?.history.map((notification) => (
            <div key={notification.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-3">
              <div>
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm text-[#C7D2E6]">{notification.message}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#7F93B7]">{notification.notification_type} / {notification.status}</div>
              </div>
              <div className="flex gap-2">
                {notification.status === "unread" ? (
                  <button className="btn-secondary" onClick={() => void notificationService.markAsRead(notification.id).then(load)}>
                    Mark Read
                  </button>
                ) : null}
                <button className="btn-secondary" onClick={() => void notificationService.remove(notification.id).then(load)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {data
        ? Object.entries(data)
            .filter(([key]) => !["unread_count", "types", "history"].includes(key))
            .map(([key, value]) => (
              <section key={key} className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
                <h2 className="mb-4 text-xl font-bold">{key.replace(/_/g, " ")}</h2>
                <div className="grid gap-3">
                  {(value as Array<Record<string, string>>).map((row, index) => (
                    <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm">
                      {Object.entries(row).map(([rowKey, rowValue]) => (
                        <div key={rowKey}>
                          <span className="text-[#7F93B7]">{rowKey.replace(/_/g, " ")}:</span> {String(rowValue)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            ))
        : null}
    </ModuleShell>
  );
}
