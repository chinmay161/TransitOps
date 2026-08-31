"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ModuleShell } from "@/components/app/ModuleShell";
import { fetchUsers, updateUserRole } from "@/lib/auth-api";
import type { UserDirectoryEntry } from "@/lib/auth-api";
import { useAuth } from "@/context/auth-context";
import {
  MagnifyingGlass,
  Funnel,
  User,
  Envelope,
  Phone,
  CheckCircle,
  Warning,
  Clock,
  UsersThree,
  Spinner,
  ShieldCheck,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  fleet_manager: "Fleet Manager",
  dispatcher: "Dispatcher",
  driver: "Driver",
  pending: "Pending",
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.2)" },
  fleet_manager: { bg: "rgba(99,102,241,0.1)", text: "#818CF8", border: "rgba(99,102,241,0.2)" },
  dispatcher: { bg: "rgba(245,166,35,0.1)", text: "#F5A623", border: "rgba(245,166,35,0.2)" },
  driver: { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "rgba(16,185,129,0.2)" },
  pending: { bg: "rgba(156,163,175,0.1)", text: "#9CA3AF", border: "rgba(156,163,175,0.2)" },
};

const ROLE_TABS = ["all", "admin", "fleet_manager", "dispatcher", "driver", "pending"] as const;
type RoleTab = (typeof ROLE_TABS)[number];

const ROLE_OPTIONS = ["admin", "fleet_manager", "dispatcher", "driver", "pending"] as const;

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ userId: string; newRole: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load user directory");
      setError(err?.message || "Failed to load user directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search));

      const matchesTab = activeTab === "all" || u.role === activeTab;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "inactive" && !u.is_active);

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [users, search, activeTab, statusFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) {
      counts[u.role] = (counts[u.role] || 0) + 1;
    }
    return counts;
  }, [users]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId);
    setConfirmRoleChange(null);
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      toast.success(`Role updated to ${ROLE_LABELS[newRole] || newRole}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
    } finally {
      setChangingRole(null);
    }
  };

  const isSelf = (userId: string) => currentUser?.id === userId;

  return (
    <ModuleShell title="User Management">
      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <UsersThree size={16} />
            <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
          </div>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{users.length}</p>
        </div>
        {(["admin", "fleet_manager", "dispatcher", "driver", "pending"] as const).map((role) => (
          <div
            key={role}
            className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ROLE_COLORS[role]?.text || "#9CA3AF" }}
              />
              <span className="text-xs font-semibold uppercase tracking-wide">{ROLE_LABELS[role]}</span>
            </div>
            <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{roleCounts[role] || 0}</p>
          </div>
        ))}
      </section>

      {/* Role Tabs */}
      <section className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        <div className="flex overflow-x-auto border-b-2 border-[var(--border-subtle)] px-4 pt-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-[var(--amber)] text-[var(--amber)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab === "all" ? "All Users" : ROLE_LABELS[tab]}
              <span className="ml-1.5 text-xs opacity-60">
                ({tab === "all" ? users.length : roleCounts[tab] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-input)] pl-12 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--amber)] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm">
              <Funnel className="h-4 w-4 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[var(--text-primary)] focus:outline-none cursor-pointer pr-4 font-medium"
              >
                <option value="all" className="bg-[var(--bg-surface)]">All Statuses</option>
                <option value="active" className="bg-[var(--bg-surface)]">Active</option>
                <option value="inactive" className="bg-[var(--bg-surface)]">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!loading && (
          <p className="px-4 sm:px-6 pb-3 text-sm text-[var(--text-secondary)]">
            Showing <span className="font-bold text-[var(--text-primary)]">{filteredUsers.length}</span> of{" "}
            <span className="font-bold text-[var(--text-primary)]">{users.length}</span> users
          </p>
        )}

        {/* Confirm Role Change Modal */}
        {confirmRoleChange && (
          <div className="mx-4 sm:mx-6 mb-4 rounded-[var(--radius-lg)] border-2 border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-[var(--amber)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Confirm Role Change
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {isSelf(confirmRoleChange.userId)
                    ? `You are about to change your own role to ${ROLE_LABELS[confirmRoleChange.newRole]}. You may lose access to admin features.`
                    : `Change this user's role to ${ROLE_LABELS[confirmRoleChange.newRole]}?`}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole)}
                    className="rounded-[var(--radius-md)] bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[#0B0F1A] hover:bg-[var(--amber-dark)] transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmRoleChange(null)}
                    className="rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Directory Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--text-secondary)]">
            <Spinner className="animate-spin text-[var(--amber)]" size={32} />
            <span className="ml-3 text-sm">Loading User Directory...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Warning size={48} className="text-[var(--red)]" />
            <span className="text-lg font-semibold text-[var(--text-primary)]">Failed to Load Users</span>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm text-center">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Warning size={48} className="text-[var(--amber)]" />
            <span className="text-lg font-semibold text-[var(--text-primary)]">No Users Found</span>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm text-center">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-[var(--text-secondary)]">
                <thead>
                  <tr className="border-b-2 border-[var(--border)] bg-[var(--bg-card)]">
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">User</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Contact</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Role</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Email Verification</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Account Status</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Created</th>
                    <th className="px-6 py-4 font-semibold text-[var(--text-tertiary)] uppercase text-xs tracking-wide">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-card)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card-hover)] text-[var(--amber)]">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)]">{u.full_name}</div>
                            <div className="text-xs text-[var(--text-tertiary)] font-mono">{u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Envelope size={14} className="text-[var(--text-tertiary)]" />
                            {u.email}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                              <Phone size={14} className="text-[var(--text-tertiary)]" />
                              {u.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                          style={{
                            background: ROLE_COLORS[u.role]?.bg || "rgba(156,163,175,0.1)",
                            color: ROLE_COLORS[u.role]?.text || "#9CA3AF",
                            borderColor: ROLE_COLORS[u.role]?.border || "rgba(156,163,175,0.2)",
                          }}
                        >
                          {ROLE_LABELS[u.role] || u.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.email_verified ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--green)]">
                            <CheckCircle size={16} weight="fill" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--red)]">
                            <Warning size={16} weight="fill" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: u.is_active ? "#10B981" : "#EF4444",
                          }}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={14} className="text-[var(--text-tertiary)]" />
                          {u.created_at
                            ? new Date(u.created_at).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={u.role}
                            disabled={changingRole === u.id}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              if (newRole === u.role) return;
                              setConfirmRoleChange({ userId: u.id, newRole });
                            }}
                            className="rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--amber)] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-7"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 6px center",
                            }}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role} className="bg-[var(--bg-surface)]">
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          {changingRole === u.id && (
                            <Spinner className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-[var(--amber)]" size={14} />
                          )}
                        </div>
                        {isSelf(u.id) && (
                          <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[var(--border-subtle)]">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  {/* Header: Name + Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card-hover)] text-[var(--amber)]">
                        <User size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--text-primary)] truncate">{u.full_name}</div>
                        <div className="text-xs text-[var(--text-tertiary)] font-mono">{u.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                      style={{
                        background: ROLE_COLORS[u.role]?.bg || "rgba(156,163,175,0.1)",
                        color: ROLE_COLORS[u.role]?.text || "#9CA3AF",
                        borderColor: ROLE_COLORS[u.role]?.border || "rgba(156,163,175,0.2)",
                      }}
                    >
                      {ROLE_LABELS[u.role] || u.role.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Envelope size={14} className="text-[var(--text-tertiary)]" />
                      {u.email}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-[var(--text-tertiary)]" />
                        {u.phone}
                      </div>
                    )}
                  </div>

                  {/* Status Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {u.email_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--green)]">
                        <CheckCircle size={12} weight="fill" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(239,68,68,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--red)]">
                        <Warning size={12} weight="fill" /> Unverified
                      </span>
                    )}
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: u.is_active ? "#10B981" : "#EF4444",
                      }}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Role Change + Date */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                      <Clock size={12} />
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      {isSelf(u.id) && <span className="text-[var(--amber)] ml-1">(You)</span>}
                    </div>
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={changingRole === u.id}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          if (newRole === u.role) return;
                          setConfirmRoleChange({ userId: u.id, newRole });
                        }}
                        className="rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] focus:border-[var(--amber)] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-7"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 6px center",
                        }}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role} className="bg-[var(--bg-surface)]">
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                      {changingRole === u.id && (
                        <Spinner className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-[var(--amber)]" size={12} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </ModuleShell>
  );
}
