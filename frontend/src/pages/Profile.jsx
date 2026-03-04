import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import {
  BadgeCheck,
  Code2,
  Flame,
  Globe,
  Github,
  Linkedin,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  CalendarDays,
  Zap,
  Edit3,
  Save,
  X,
  Award,
  RadioTowerIcon,
  Rocket,
  Zap as ZapIcon,
  Heart,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const tabs = ["Solutions", "Posts", "Contests"];

// Avatar preset options
const avatarPresets = [
  {
    id: "lorelei",
    name: "Lorelei",
    preview: "https://api.dicebear.com/9.x/lorelei/svg?seed=default",
  },
  {
    id: "avataaars",
    name: "Avataaars",
    preview: "https://api.dicebear.com/9.x/avataaars/svg?seed=default",
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    preview: "https://api.dicebear.com/9.x/pixel-art/svg?seed=default",
  },
  {
    id: "adventurer",
    name: "Adventurer",
    preview: "https://api.dicebear.com/9.x/adventurer/svg?seed=default",
  },
];

const badges = [
  { name: "First Problem Solved", icon: "🎯", color: "from-violet-500/25 to-violet-400/10" },
  { name: "7 Day Streak", icon: "🔥", color: "from-orange-500/25 to-amber-400/10" },
  { name: "50 Problems Solved", icon: "💡", color: "from-fuchsia-500/25 to-purple-400/10" },
  { name: "Hard Problem Slayer", icon: "⚔️", color: "from-rose-500/25 to-orange-400/10" },
  { name: "Contest Winner", icon: "🏆", color: "from-yellow-500/25 to-orange-500/10" },
];

function cardBase() {
  return "rounded-2xl border border-violet-500/20 bg-slate-900/70 backdrop-blur-sm p-5";
}

function HeatCell({ value }) {
  const levels = [
    "bg-slate-800",
    "bg-violet-900/60",
    "bg-violet-700/70",
    "bg-fuchsia-600/80",
    "bg-orange-500/85",
  ];
  return <div className={`h-3 w-3 rounded-xs ${levels[Math.min(value, levels.length - 1)]}`} />;
}

function RadarChart({ labels, values }) {
  const size = 320;
  const center = size / 2;
  const radius = 110;

  const points = values
    .map((value, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const r = (value / 100) * radius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-72 w-72">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            className="stroke-violet-500/20"
          />
        ))}
        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = center + Math.cos(angle) * (radius + 24);
          const y = center + Math.sin(angle) * (radius + 24);
          const lx = center + Math.cos(angle) * radius;
          const ly = center + Math.sin(angle) * radius;
          return (
            <g key={label}>
              <line x1={center} y1={center} x2={lx} y2={ly} className="stroke-violet-500/20" />
              <text x={x} y={y} textAnchor="middle" className="fill-slate-300 text-[11px] font-medium">
                {label}
              </text>
            </g>
          );
        })}
        <polygon points={points} className="fill-orange-500/30 stroke-orange-400" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function Profile() {
  const { user: authUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Solutions");
  const [profilePayload, setProfilePayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    avatar: "",
    bio: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    shareProfile: "",
    goalTarget: 500,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (yearParam = null) => {
      if (!authUser) {
        console.log("[PROFILE] No auth user, skipping profile fetch");
        setLoading(false);
        return;
      }

      try {
        console.log("[PROFILE] Fetching profile for user:", authUser._id || authUser.emailId);
        const url = yearParam ? `/user/profile?year=${yearParam}` : "/user/profile";
        const { data } = await axiosClient.get(url);
        console.log("[PROFILE] Profile data received:", data);
        
        if (isMounted && data?.success) {
          setProfilePayload(data);
          if (data.profile) {
            setFormData({
              firstName: data.profile.firstName || authUser?.firstName || "",
              lastName: data.profile.lastName || authUser?.lastName || "",
              username: data.profile.username || "",
              avatar: data.profile.avatar || "",
              bio: data.profile.bio || "",
              location: data.profile.location || "",
              github: data.profile.github || "",
              linkedin: data.profile.linkedin || "",
              portfolio: data.profile.portfolio || "",
              shareProfile: data.profile.shareProfile || "",
              goalTarget: data.goal?.target || 500,
            });
            console.log("[PROFILE] Profile loaded successfully, streak:", data.profile.streak);
          }
        } else {
          console.warn("[PROFILE] Invalid response:", data);
        }
      } catch (error) {
        console.error("[PROFILE] Failed to fetch profile", error);
        console.error("[PROFILE] Error details:", error.response?.data);
        if (isMounted) {
          setToast({ msg: "Failed to load profile. Please refresh the page.", type: "error" });
          setTimeout(() => setToast(null), 5000);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    window.refreshProfile = fetchProfile; // Expose for manual refresh
    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleRefreshHeatmap = async () => {
    try {
      const { data } = await axiosClient.get(`/user/profile?year=${selectedYear}`);
      if (data?.success) {
        setProfilePayload(data);
        setToast({ msg: "Heatmap updated! ✨", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Failed to refresh heatmap", error);
    }
  };

  // Auto-refresh heatmap every 60 seconds for real-time data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      handleRefreshHeatmap();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(refreshInterval);
  }, [selectedYear]);

  // Fetch heatmap data when year changes
  useEffect(() => {
    if (authUser) {
      const url = `/user/profile?year=${selectedYear}`;
      axiosClient.get(url).then(({ data }) => {
        if (data?.success) {
          setProfilePayload(data);
        }
      }).catch(err => console.error("Failed to fetch heatmap for year", err));
    }
  }, [selectedYear, authUser]);

  // Listen for profile updates (triggered after successful submission)
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (authUser) {
        try {
          console.log("[PROFILE DEBUG] Refreshing profile after submission...");
          const { data } = await axiosClient.get(`/user/profile?year=${selectedYear}`);
          if (data?.success) {
            console.log("[PROFILE DEBUG] New streak value:", data.profile.streak);
            setProfilePayload(data);
            setToast({ msg: "Profile updated! Streak refreshed 🔥", type: "success" });
            setTimeout(() => setToast(null), 3000);
          }
        } catch (err) {
          console.error("Failed to refresh profile after submission:", err);
        }
      }
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, [authUser, selectedYear]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data } = await axiosClient.patch("/user/profile", formData);
      if (data?.success) {
        // Update profilePayload with new data
        setProfilePayload((prev) => ({
          ...prev,
          profile: {
            ...prev?.profile,
            ...formData,
          },
        }));
        // Refresh the full profile to ensure everything is in sync
        const { data: freshData } = await axiosClient.get("/user/profile");
        if (freshData?.success) {
          setProfilePayload(freshData);
        }
        setIsEditing(false);
        setToast({ msg: "Profile updated successfully!", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      setToast({ msg: error?.response?.data?.error || "Failed to save profile", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form from profilePayload which has the saved data from DB
    if (profilePayload?.profile) {
      setFormData({
        firstName: profilePayload.profile.firstName || authUser?.firstName || "",
        lastName: profilePayload.profile.lastName || authUser?.lastName || "",
        username: profilePayload.profile.username || "",
        avatar: profilePayload.profile.avatar || "",
        bio: profilePayload.profile.bio || "",
        location: profilePayload.profile.location || "",
        github: profilePayload.profile.github || "",
        linkedin: profilePayload.profile.linkedin || "",
        portfolio: profilePayload.profile.portfolio || "",
        shareProfile: profilePayload.profile.shareProfile || "",
        goalTarget: profilePayload.goal?.target || 500,
      });
    }
  };

  const profile = profilePayload?.profile || {
    username: authUser?.emailId ? authUser.emailId.split("@")[0] : "neo_coder",
    name: authUser?.firstName || "Arjun Sharma",
    avatar: "https://api.dicebear.com/9.x/lorelei/svg?seed=Kodolio",
    bio: "Competitive programmer building scalable systems and solving hard problems daily.",
    location: "India",
    joined: "Jan 2023",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    portfolio: "https://example.com",
    rating: 1200,
    rank: 50000,
    streak: 0,
    solved: 0,
    followers: 0,
    following: 0,
    friends: 0,
  };

  const codingStats = profilePayload?.codingStats || {
    totalSolved: profile.solved,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    contestRating: profile.rating,
    maxStreak: profile.streak,
    totalContestsParticipated: 0,
  };

  const profileStatCards = [
    { label: "Total Solved", value: codingStats.totalSolved, icon: Code2, accent: "from-violet-500 to-purple-500" },
    { label: "Easy Solved", value: codingStats.easySolved, icon: BadgeCheck, accent: "from-emerald-500 to-green-500" },
    { label: "Medium Solved", value: codingStats.mediumSolved, icon: Flame, accent: "from-amber-500 to-orange-500" },
    { label: "Hard Solved", value: codingStats.hardSolved, icon: Trophy, accent: "from-rose-500 to-pink-500" },
    { label: "Contest Rating", value: codingStats.contestRating, icon: TrendingUp, accent: "from-fuchsia-500 to-violet-500" },
    { label: "Max Streak", value: `${codingStats.maxStreak} days`, icon: Zap, accent: "from-orange-500 to-amber-500" },
    { label: "Total Contests", value: codingStats.totalContestsParticipated, icon: Swords, accent: "from-purple-500 to-indigo-500" },
  ];

  // Month-based heatmap (current month only)
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedMonth, selectedYear]);

  const heatmapValues = useMemo(() => {
    if (profilePayload?.heatmapValues?.length) {
      // Backend returns 365-day array indexed by day of year (0-364)
      // Calculate starting day index for selected month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const yearStart = new Date(selectedYear, 0, 1);
      const dayOfYear = Math.floor((startDate - yearStart) / (24 * 60 * 60 * 1000));
      
      // Get data for this month (dayOfYear to dayOfYear + daysInMonth)
      return profilePayload.heatmapValues.slice(dayOfYear, dayOfYear + daysInMonth);
    }
    return Array.from({ length: daysInMonth }, () => 0);
  }, [profilePayload?.heatmapValues, daysInMonth, selectedMonth, selectedYear]);

  const monthYearDisplay = useMemo(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${monthNames[selectedMonth]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    
    if (nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth())) {
      return;
    }
    
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };



  const radarLabels = profilePayload?.skillRadar?.length
    ? profilePayload.skillRadar.map((item) => item.topic)
    : ["Arrays", "Dynamic Programming", "Graphs", "Trees", "Greedy", "Strings"];
  const radarValues = profilePayload?.skillRadar?.length
    ? profilePayload.skillRadar.map((item) => item.value)
    : [86, 78, 82, 88, 74, 91];

  const mergedBadges = badges.map((fallbackBadge) => {
    const backendBadge = profilePayload?.badges?.find((badge) => badge.name === fallbackBadge.name);
    return {
      ...fallbackBadge,
      icon: backendBadge?.icon || fallbackBadge.icon,
      earned: backendBadge?.earned ?? true,
    };
  });

  const mergedRecentActivity = profilePayload?.recentActivity || [];

  const tabData = {
    Solutions:
      profilePayload?.tabs?.solutions?.length
        ? profilePayload.tabs.solutions
        : [
            "Optimized Dijkstra with path reconstruction",
            "Binary lifting for Kth ancestor",
            "Segment tree with lazy propagation",
          ],
    Posts:
      profilePayload?.tabs?.posts?.length
        ? profilePayload.tabs.posts
        : [
            "How I approach graph problems under contest pressure",
            "DP patterns that appear in coding interviews",
            "Template for fast CP debugging",
          ],
    Contests:
      profilePayload?.tabs?.contests?.length
        ? profilePayload.tabs.contests
        : [
            "Weekly Contest 412 - Rank #92",
            "Biweekly Contest 151 - Rank #133",
            "Kodolio Arena Round 9 - Rank #48",
          ],
  };

  const goalCurrent = profilePayload?.goal?.current ?? profile.solved;
  const goalTarget = profilePayload?.goal?.target ?? 500;
  const goalPercent = Math.round((goalCurrent / goalTarget) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.15),transparent_40%)]" />
      <div className="pointer-events-none absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-violet-600/10 to-purple-500/5 rounded-3xl rotate-12 blur-2xl" />
      <div className="pointer-events-none absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-orange-600/10 to-amber-500/5 rounded-3xl -rotate-12 blur-2xl" />
      <div className="pointer-events-none absolute bottom-32 left-1/4 w-72 h-72 bg-gradient-to-br from-fuchsia-600/10 to-violet-500/5 rounded-3xl rotate-45 blur-2xl" />
      <div className="pointer-events-none absolute bottom-20 right-1/3 w-60 h-60 bg-gradient-to-br from-orange-500/10 to-rose-500/5 rounded-3xl -rotate-45 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.06)_1px,transparent_1px)] bg-size-[38px_38px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10 space-y-6">
        {!authUser && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-center text-rose-200">
            <AlertTriangle className="inline-block mr-2" size={18} />
            Please log in to view your profile.
          </div>
        )}
        {toast && (
          <div className={`rounded-xl border p-4 flex items-center gap-3 ${toast.type === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.msg}</span>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-violet-500/20 bg-slate-900/60 p-3 text-center text-sm text-slate-300">
            Loading profile from backend...
          </div>
        )}

        <section className={`${cardBase()} overflow-hidden`}>
          <div className="h-32 rounded-xl bg-transparent" />
          <div className="-mt-14 flex flex-col gap-5 px-2 pb-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">🎨 Choose Avatar Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {avatarPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setFormData({ ...formData, avatar: preset.preview })}
                          className={`relative rounded-xl border-2 p-3 transition-all ${
                            formData.avatar === preset.preview
                              ? "border-orange-400 bg-orange-500/20"
                              : "border-violet-500/30 bg-slate-800/40 hover:border-violet-400"
                          }`}
                        >
                          <img
                            src={preset.preview}
                            alt={preset.name}
                            className="w-full h-20 rounded-lg object-cover mb-2"
                          />
                          <p className="text-xs font-medium text-slate-300 text-center">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or Custom URL</label>
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-28 w-28 rounded-2xl border-4 border-slate-950 object-cover shadow-[0_0_30px_rgba(168,85,247,0.45)]"
                />
              )}
              <div className="pt-2 flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">📍 Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🎯 Goal Target</label>
                        <input
                          type="number"
                          value={formData.goalTarget}
                          onChange={(e) => setFormData({ ...formData, goalTarget: Math.max(1, parseInt(e.target.value) || 1) })}
                          min="1"
                          max="10000"
                          className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-orange-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                    <p className="text-violet-300">@{profile.username}</p>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">{profile.bio}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> Joined {profile.joined}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:flex-col">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
                  >
                    <Save size={16} /> {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 bg-slate-800/40 px-4 py-2 text-sm font-semibold hover:border-slate-400 transition"
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold hover:brightness-110 transition"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-slate-900/60 px-4 py-2 text-sm font-semibold hover:border-orange-400/60 hover:text-orange-200 transition">
                    <Share2 size={16} /> Share
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-4 space-y-3 border-t border-violet-500/20 pt-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Rocket size={16} className="text-orange-400" /> Social Links
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🐙 GitHub</label>
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="github.com/username or full URL"
                    className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">💼 LinkedIn</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username or full URL"
                    className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🔗 Portfolio</label>
                  <input
                    type="text"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">📤 Share Link</label>
                  <input
                    type="text"
                    value={formData.shareProfile}
                    onChange={(e) => setFormData({ ...formData, shareProfile: e.target.value })}
                    placeholder="https://kodolio.com/profile/your-link"
                    className="w-full rounded-lg border border-violet-500/30 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="mt-4 flex flex-wrap gap-3 text-sm border-t border-violet-500/20 pt-4">
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-violet-300 hover:text-orange-300 transition">
                  <Github size={16} /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-violet-300 hover:text-orange-300 transition">
                  <Linkedin size={16} /> LinkedIn
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-violet-300 hover:text-orange-300 transition">
                  <LinkIcon size={16} /> Portfolio
                </a>
              )}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Rating", value: profile.rating, icon: TrendingUp },
              { label: "Global Rank", value: `#${profile.rank}`, icon: Globe },
              { label: "Current Streak", value: `${profile.streak} days`, icon: Flame },
              { label: "Problems Solved", value: profile.solved, icon: Code2 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-violet-500/20 bg-slate-950/60 p-4 hover:-translate-y-1 hover:border-orange-400/50 transition-all">
                <div className="mb-2 inline-flex rounded-lg bg-violet-500/15 p-2 text-orange-300">
                  <item.icon size={16} />
                </div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-lg font-bold text-violet-100">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {profileStatCards.map((stat) => (
            <article
              key={stat.label}
              className={`${cardBase()} group hover:-translate-y-1 transition-transform`}
            >
              <div className={`inline-flex rounded-xl bg-linear-to-br ${stat.accent} p-3 text-white`}>
                <stat.icon size={18} />
              </div>
              <p className="mt-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-100 mt-2">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className={`${cardBase()}`}>
            {/* Heatmap Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ZapIcon size={18} className="text-orange-400" /> Activity Heatmap
                </h2>
                <p className="text-xs text-slate-400 mt-1">{monthYearDisplay}</p>
              </div>
              <button
                onClick={handleRefreshHeatmap}
                className="p-2 hover:bg-slate-700/40 rounded-lg transition text-slate-300 hover:text-orange-400"
                title="Refresh heatmap"
              >
                <RefreshCw size={16} className="hover:animate-spin" />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-1 hover:bg-slate-700/40 rounded-lg transition text-slate-300 hover:text-orange-400 text-sm"
              >
                ←
              </button>
              <span className="text-sm font-semibold text-slate-300 min-w-30 text-center">{monthYearDisplay}</span>
              <button
                onClick={handleNextMonth}
                disabled={(() => {
                  const today = new Date();
                  const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                  const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                  return nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth());
                })()}
                className="px-3 py-1 hover:bg-slate-700/40 rounded-lg transition text-slate-300 hover:text-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                →
              </button>
            </div>

            {/* Heatmap Grid - 7 columns */}
            <div className="flex justify-center mb-4">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gridAutoRows: "auto" }}>
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs text-slate-500 font-semibold text-center py-1 px-1.5">
                    {day}
                  </div>
                ))}

                {/* Empty cells for first day offset */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-4 h-4" />
                ))}

                {/* Date cells */}
                {heatmapValues.map((value, i) => {
                  const day = i + 1;
                  const date = new Date(selectedYear, selectedMonth, day);
                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const contributions = [0, 1, 2, 3, 5, 8][Math.min(value, 5)] || 0;

                  return (
                    <div key={i} className="relative group">
                      <HeatCell value={value} />
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-orange-500/50 rounded-lg px-2 py-1 text-xs text-slate-200 whitespace-nowrap z-50 pointer-events-none transition-opacity duration-100 shadow-lg">
                        <div className="text-orange-300 font-medium">{contributions} on {dateStr}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-700/40">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <HeatCell key={level} value={level} />
              ))}
              <span>More</span>
            </div>
          </article>

          <article className={cardBase()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star size={18} className="text-yellow-400" /> Skill Radar
              </h2>
              <span className="text-xs text-slate-400">Proficiency</span>
            </div>
            <RadarChart labels={radarLabels} values={radarValues} />
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className={cardBase()}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Achievements
            </h2>
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {mergedBadges.map((badge) => (
                <div
                  key={badge.name}
                  className={`rounded-xl border border-violet-500/20 bg-linear-to-r ${badge.color} p-3 transition-all ${badge.earned ? "hover:scale-[1.02] hover:border-orange-400/50 cursor-pointer" : "opacity-45 grayscale"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={cardBase()}>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <RadioTowerIcon size={18} className="text-purple-400" /> Recent Activity
            </h2>
            {mergedRecentActivity.length > 0 ? (
              <ol className="mt-4 space-y-4">
                {mergedRecentActivity.map((item) => (
                  <li key={item.text} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-linear-to-r from-violet-400 to-orange-400" />
                    <p className="text-sm text-slate-200">{item.text}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-400 text-center py-8">
                No submissions yet. Start solving problems!
              </p>
            )}
          </article>
        </section>

        <section className={cardBase()}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold inline-flex items-center gap-2">
              <Target size={18} className="text-orange-400" /> Goal Progress
            </h2>
            <span className="text-sm text-slate-300">Target: {goalTarget} Problems</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-orange-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {goalCurrent} / {goalTarget} completed • {goalPercent}% done
          </p>
        </section>

        <div className="pb-6 text-center text-xs text-slate-500 inline-flex w-full items-center justify-center gap-1">
          <Star size={12} className="text-orange-400" /> Kodolio Profile
        </div>
      </div>
    </div>
  );
}
