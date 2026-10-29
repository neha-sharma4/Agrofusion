import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink, Outlet } from "react-router-dom";
import { AdminApi } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { AgriIcon, type AgriIconName, Button, Card, EmptyState, Field, Input, SkeletonCard, StatusBadge, Textarea } from "../../components/ui";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold transition-all duration-150 ${
    isActive
      ? "bg-forest-900 text-white shadow-xs"
      : "bg-white border border-stone-200 text-stone-700 hover:border-forest-700 hover:text-stone-950 shadow-2xs"
  }`;

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#eaf3ed] via-[#f1f7f3] to-[#e8f4ec] text-stone-900">
      {/* Admin Top Executive Header (Distinct Professional SaaS Look) */}
      <header className="sticky top-0 z-30 border-b border-stone-800/80 bg-[#071f14] text-white px-4 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-emerald-400 shadow-xs">
              <AgriIcon name="database" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-white leading-none">
                  AgroFusion<span className="text-emerald-400">.ai</span>
                </span>
                <span className="rounded-md bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Admin Console
                </span>
              </div>
              <p className="font-mono text-[10px] text-emerald-300/60 mt-0.5">Telemetry, User Accounts & Master Agronomic Models</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/fields"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-emerald-100 hover:bg-white/20 shadow-2xs transition-colors"
            >
              <AgriIcon name="sprout" className="h-3.5 w-3.5 text-emerald-400" />
              <span>Farmer App →</span>
            </NavLink>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-semibold text-stone-300 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <AgriIcon name="logout" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 pb-20 space-y-6">
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-2.5 border-b border-stone-200/80 pb-4">
          <NavLink end className={navClass} to="/admin">
            <AgriIcon name="trendingUp" className="h-3.5 w-3.5" />
            <span>Operational Analytics</span>
          </NavLink>
          <NavLink className={navClass} to="/admin/users">
            <AgriIcon name="user" className="h-3.5 w-3.5" />
            <span>Users & Access</span>
          </NavLink>
          <NavLink className={navClass} to="/admin/logs">
            <AgriIcon name="activity" className="h-3.5 w-3.5" />
            <span>AI Safety Logs</span>
          </NavLink>
          <NavLink className={navClass} to="/admin/master">
            <AgriIcon name="layers" className="h-3.5 w-3.5" />
            <span>Master Crops</span>
          </NavLink>
          <NavLink className={navClass} to="/admin/knowledge">
            <AgriIcon name="shieldCheck" className="h-3.5 w-3.5" />
            <span>Verified Knowledge Base</span>
          </NavLink>
        </nav>

        <Outlet />
      </main>
    </div>
  );
}

// ==========================================
// 1. ADMIN ANALYTICS DASHBOARD
// ==========================================
export function AdminAnalytics() {
  const q = useQuery({ queryKey: ["admin-analytics"], queryFn: AdminApi.analytics });

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const data = (q.data ?? {}) as Record<string, any>;
  const mostSelectedCrops = (data.mostSelectedCrops ?? []) as { crop: string; count: number }[];
  const mostDetectedDiseases = (data.mostDetectedDiseases ?? []) as { disease: string; count: number }[];

  const maxCropCount = Math.max(1, ...mostSelectedCrops.map((c) => c.count));
  const maxDiseaseCount = Math.max(1, ...mostDetectedDiseases.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* 6 Key Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatMetricCard
          label="Total Users"
          value={data.totalUsers}
          icon="user"
          color="leaf"
        />
        <StatMetricCard
          label="Registered Fields"
          value={data.fields}
          icon="layers"
          color="stone"
        />
        <StatMetricCard
          label="Irrigations"
          value={data.irrigationRecommendations}
          icon="droplet"
          color="sky"
        />
        <StatMetricCard
          label="Disease Scans"
          value={data.diseaseScans}
          icon="scan"
          color="emerald"
        />
        <StatMetricCard
          label="Flagged AI"
          value={data.flaggedLlmOutputs}
          icon="alertTriangle"
          color="amber"
        />
        <StatMetricCard
          label="Failed Calls"
          value={data.failedLlmRequests}
          icon="x"
          color="rose"
        />
      </div>

      {/* Two Ranked Agronomic Frequency Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Selected Crops Bar Chart */}
        <Card className="border-emerald-200/80 bg-white/95 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 flex items-center gap-2">
                <AgriIcon name="sprout" className="h-5 w-5 text-forest-700" />
                <span>Most Cultivated Crop Varieties</span>
              </h3>
              <p className="text-xs text-stone-500">Distribution of initiated seasonal crop cycles across holdings</p>
            </div>
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-1 rounded-full">
              {mostSelectedCrops.length} Crops
            </span>
          </div>

          {mostSelectedCrops.length > 0 ? (
            <div className="space-y-3.5 pt-1">
              {mostSelectedCrops.map((c) => {
                const pct = Math.round((c.count / maxCropCount) * 100);
                return (
                  <div key={c.crop} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-900 font-sans">{c.crop}</span>
                      <span className="font-mono text-forest-800 font-bold">{c.count} cycles ({pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-emerald-100/60 overflow-hidden">
                      <div
                        className="h-full bg-forest-700 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center font-mono text-xs text-stone-400">
              No crop cycles registered in database yet.
            </div>
          )}
        </Card>

        {/* Most Detected Plant Conditions Bar Chart */}
        <Card className="border-emerald-200/80 bg-white/95 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-stone-950 flex items-center gap-2">
                <AgriIcon name="alertTriangle" className="h-5 w-5 text-amber-600" />
                <span>Most Detected Foliar Conditions</span>
              </h3>
              <p className="text-xs text-stone-500">Identified crop pathology cases from Multimodal Vision AI</p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {mostDetectedDiseases.length} Pathogens
            </span>
          </div>

          {mostDetectedDiseases.length > 0 ? (
            <div className="space-y-3.5 pt-1">
              {mostDetectedDiseases.map((d) => {
                const pct = Math.round((d.count / maxDiseaseCount) * 100);
                return (
                  <div key={d.disease} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-900 font-sans">{d.disease}</span>
                      <span className="font-mono text-amber-800 font-bold">{d.count} scans ({pct}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-amber-100/60 overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center font-mono text-xs text-stone-400">
              No plant disease conditions diagnosed yet.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatMetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: unknown;
  icon: AgriIconName;
  color: "leaf" | "stone" | "sky" | "emerald" | "amber" | "rose";
}) {
  const colorStyles = {
    leaf: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stone: "bg-stone-100 text-stone-700 border-stone-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
  }[color];

  return (
    <Card className="p-4 sm:p-5 border-emerald-200/80 bg-white/95 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
          {label}
        </span>
        <span className={`p-1.5 rounded-xl border ${colorStyles} shrink-0`}>
          <AgriIcon name={icon} className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2.5 font-mono text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
        {String(value ?? 0)}
      </div>
    </Card>
  );
}

// ==========================================
// 2. ADMIN USER MANAGEMENT TABLE
// ==========================================
export function AdminUsers() {
  const q = useQuery({ queryKey: ["admin-users"], queryFn: AdminApi.users });
  const [search, setSearch] = useState("");

  if (q.isLoading) return <SkeletonCard />;

  const users = (q.data as
    | { id: string; name: string; email: string; isEmailVerified: boolean; accountStatus: string; createdAt: string }[]
    | undefined) ?? [];

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">User Directory</h2>
          <p className="text-xs text-stone-500">Manage registered farmer accounts and account standing</p>
        </div>
        <div className="sm:w-64">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-emerald-200/80 bg-white/95 shadow-2xs overflow-hidden p-0 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f8f2] border-b border-emerald-200/80 text-[11px] font-mono font-bold uppercase tracking-wider text-forest-900">
              <tr>
                <th className="px-5 py-3.5">Farmer Profile</th>
                <th className="px-5 py-3.5">Email Verification</th>
                <th className="px-5 py-3.5">Account Standing</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-100 text-forest-800 font-mono font-bold text-xs">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 font-sans">{u.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      label={u.isEmailVerified ? "Verified" : "Unverified"}
                      variant={u.isEmailVerified ? "healthy" : "attention"}
                      size="sm"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      label={u.accountStatus}
                      variant={u.accountStatus === "ACTIVE" ? "healthy" : "critical"}
                      size="sm"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-stone-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        void AdminApi.setUser(
                          u.id,
                          u.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                        ).then(() => q.refetch())
                      }
                      className={`font-mono text-xs font-bold px-3 py-1 rounded-xl border transition-colors cursor-pointer ${
                        u.accountStatus === "ACTIVE"
                          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {u.accountStatus === "ACTIVE" ? "Suspend Account" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 3. ADMIN AI AUDIT LOGS
// ==========================================
export function AdminLogs() {
  const [flagged, setFlagged] = useState(false);
  const q = useQuery({ queryKey: ["admin-logs", flagged], queryFn: () => AdminApi.logs(flagged) });

  if (q.isLoading) return <SkeletonCard />;

  const logs = (q.data as
    | { id: string; endpoint: string; validationStatus: string; confidence: number | null; flaggedForReview: boolean; createdAt: string }[]
    | undefined) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900">AI Inference Audit Logs</h2>
          <p className="text-xs text-stone-500">Real-time telemetry and safety threshold validation events</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-3.5 py-2 font-mono text-xs font-semibold text-stone-700 cursor-pointer shadow-2xs">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(e) => setFlagged(e.target.checked)}
            className="rounded text-forest-700 focus:ring-forest-600"
          />
          <span>Show Flagged Items Only</span>
        </label>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No log entries matching filter"
          description="Inference calls and safety validation logs will be recorded as users interact with the AI services."
        />
      ) : (
        <div className="space-y-2.5">
          {logs.map((l) => (
            <Card key={l.id} className="p-4 border-emerald-200/70 bg-white/95 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-900 border border-stone-200 px-2.5 py-0.5 rounded-md">
                    {l.endpoint}
                  </span>
                  <StatusBadge
                    label={l.validationStatus}
                    variant={l.validationStatus === "VALID" ? "healthy" : "attention"}
                    size="sm"
                  />
                  {l.flaggedForReview && (
                    <span className="rounded-md bg-rose-50 border border-rose-200 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-700">
                      FLAGGED FOR REVIEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-stone-500">
                  <span>Confidence: <strong className="text-stone-800">{l.confidence !== null ? `${Math.round(l.confidence * 100)}%` : "n/a"}</strong></span>
                  <span className="text-stone-300">|</span>
                  <span>{new Date(l.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ADMIN MASTER CROP CATALOG
// ==========================================
export function AdminMaster() {
  const crops = useQuery({ queryKey: ["admin-crops"], queryFn: AdminApi.crops });
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vegetable");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-stone-900">Master Crop Catalog</h2>
        <p className="text-xs text-stone-500">Register new agricultural crops for regional suitability checks</p>
      </div>

      <Card className="border-emerald-200/80 bg-white/95 shadow-2xs p-6 space-y-4">
        <h3 className="font-mono text-xs font-bold text-forest-800 uppercase tracking-wider mb-2">
          Register New Crop
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Crop Name" required>
            <Input
              placeholder="e.g. Maize, Mustard, Tomato"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Category" required>
            <Input
              placeholder="e.g. Cereal, Pulse, Vegetable"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Field>
        </div>
        <div className="pt-2 flex justify-end">
          <Button
            size="md"
            className="w-auto shadow-xs"
            disabled={!name.trim() || saving}
            loading={saving}
            icon="plus"
            onClick={() => {
              setSaving(true);
              void AdminApi.createCrop({ name, category })
                .then(() => {
                  setName("");
                  void crops.refetch();
                })
                .finally(() => setSaving(false));
            }}
          >
            Save Crop to Catalog
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
          Existing Catalog ({(crops.data ?? []).length} Crops)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {(crops.data ?? []).map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-emerald-200/70 bg-white/95 p-4 shadow-2xs hover:border-forest-700 transition-colors"
            >
              <div className="font-display font-bold text-base text-stone-950">{c.name}</div>
              <div className="font-mono text-[11px] text-stone-500 mt-1">Crop Variety Index</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. ADMIN VERIFIED KNOWLEDGE BASE
// ==========================================
export function AdminKnowledge() {
  const q = useQuery({ queryKey: ["admin-kb"], queryFn: AdminApi.knowledge });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("ICAR");
  const [saving, setSaving] = useState(false);

  if (q.isLoading) return <SkeletonCard />;

  const articles = (q.data as { id: string; title: string; sourceName: string }[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-stone-900">Agronomic Knowledge Base</h2>
        <p className="text-xs text-stone-500">Curate verified treatment protocols and ICAR/CIBRC references</p>
      </div>

      <Card className="border-emerald-200/80 bg-white/95 shadow-2xs p-6 space-y-4">
        <h3 className="font-mono text-xs font-bold text-forest-800 uppercase tracking-wider">
          Publish Verified Agronomic Article
        </h3>
        <Field label="Condition or Pathology Title" required>
          <Input
            placeholder="e.g. Rice Blast Management Protocol"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Treatment & Prescribed Dosages" required>
          <Textarea
            rows={4}
            placeholder="Chemical / biological controls, dosage per hectare, spraying frequency…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
        <Field label="Source Authority / Institute" required>
          <Input
            placeholder="e.g. ICAR, IARI, CIBRC"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
          />
        </Field>
        <div className="pt-2 flex justify-end">
          <Button
            size="md"
            className="w-auto shadow-xs"
            disabled={!title.trim() || !content.trim() || saving}
            loading={saving}
            icon="shieldCheck"
            onClick={() => {
              setSaving(true);
              void AdminApi.createKnowledge({
                category: "DISEASE",
                title,
                content,
                sourceName,
                isVerified: true,
              })
                .then(() => {
                  setTitle("");
                  setContent("");
                  void q.refetch();
                })
                .finally(() => setSaving(false));
            }}
          >
            Publish Verified Protocol
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-500">
          Published Knowledge Articles ({articles.length})
        </h3>
        <div className="space-y-3">
          {articles.map((k) => (
            <Card key={k.id} className="p-5 border-emerald-200/70 bg-white/95 shadow-2xs flex items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-base text-stone-950">{k.title}</h4>
                <div className="mt-1 font-mono text-xs text-forest-800 font-semibold flex items-center gap-1.5">
                  <AgriIcon name="shieldCheck" className="h-4 w-4 text-forest-700" />
                  <span>Authority Source: {k.sourceName}</span>
                </div>
              </div>
              <StatusBadge label="Verified Protocol" variant="verified" size="sm" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
