"use client";

import { useEffect, useState } from "react";
import { ModuleShell } from "@/components/app/ModuleShell";
import { fetchUsers } from "@/lib/auth-api";
import type { UserDirectoryEntry } from "@/lib/auth-api";
import { MagnifyingGlass, Funnel, User, Envelope, Phone, ShieldCheck, CheckCircle, Warning, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function UserDirectoryPage() {
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load user directory");
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "inactive" && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <ModuleShell title="User Directory">
      {/* Search and Filters Section */}
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7F93B7]" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/8 bg-[#070D1A] pl-12 pr-4 py-3 text-sm text-[#F0F4FF] placeholder-[#4A5D7C] focus:border-[#F5A623] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-2 text-sm">
              <Funnel className="h-4 w-4 text-[#7F93B7]" />
              <span className="text-[#7F93B7]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent border-none text-[#F0F4FF] focus:outline-none cursor-pointer pr-4 font-medium"
              >
                <option value="all" className="bg-[#0D1526]">All Roles</option>
                <option value="admin" className="bg-[#0D1526]">Admin</option>
                <option value="fleet_manager" className="bg-[#0D1526]">Fleet Manager</option>
                <option value="dispatcher" className="bg-[#0D1526]">Dispatcher</option>
                <option value="driver" className="bg-[#0D1526]">Driver</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-2 text-sm">
              <span className="text-[#7F93B7]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[#F0F4FF] focus:outline-none cursor-pointer pr-4 font-medium"
              >
                <option value="all" className="bg-[#0D1526]">All Statuses</option>
                <option value="active" className="bg-[#0D1526]">Active</option>
                <option value="inactive" className="bg-[#0D1526]">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Table Section */}
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#7F93B7]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623] mr-3"></div>
            Loading User Directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#7F93B7] gap-3">
            <Warning size={48} className="text-[#D4891A]" />
            <span className="text-lg font-semibold text-[#F0F4FF]">No Users Found</span>
            <p className="text-sm text-[#7F93B7] max-w-sm text-center">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-[#C7D2E6]">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02] font-semibold text-[#7F93B7]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email Verification</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* User Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-[#F5A623]">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-[#F0F4FF]">{u.full_name}</div>
                          <div className="text-xs text-[#7F93B7] font-mono">{u.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#C7D2E6]">
                          <Envelope size={14} className="text-[#7F93B7]" />
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[#C7D2E6]">
                            <Phone size={14} className="text-[#7F93B7]" />
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-white/[0.05] capitalize text-[#C7D2E6] border border-white/5">
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Email Verification */}
                    <td className="px-6 py-4">
                      {u.email_verified ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                          <CheckCircle size={16} weight="fill" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444]">
                          <Warning size={16} weight="fill" /> Unverified
                        </span>
                      )}
                    </td>

                    {/* Approval Status */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background:
                            u.approval_status === "approved"
                              ? "rgba(16, 185, 129, 0.1)"
                              : u.approval_status === "pending"
                              ? "rgba(245, 166, 35, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                          color:
                            u.approval_status === "approved"
                              ? "#10B981"
                              : u.approval_status === "pending"
                              ? "#F5A623"
                              : "#EF4444",
                        }}
                      >
                        {u.approval_status || "approved"}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock size={14} className="text-[#7F93B7]" />
                        {u.last_login
                          ? new Date(u.last_login).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Never logged in"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ModuleShell>
  );
}
