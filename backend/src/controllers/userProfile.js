const Submission = require("../models/submission");
const Problem = require("../models/promblem");

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue);
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
  }
  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h ago`;
  }
  return `${Math.floor(diffMs / day)}d ago`;
}

function computeStreak(daySet) {
  if (!daySet.size) {
    console.log("[STREAK] No submissions found, returning 0");
    return 0;
  }
  
  // Use UTC to avoid timezone issues
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const todayStr = today.toISOString().slice(0, 10);
  
  console.log("[STREAK] Today's date (UTC):", todayStr);
  console.log("[STREAK] Days in set:", Array.from(daySet).sort().reverse().slice(0, 10));

  let streak = 0;
  const cursor = new Date(today);

  // Check from today backwards
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  if (streak > 0) {
    console.log("[STREAK] Found streak starting from today:", streak);
    return streak;
  }

  // If no submission today, check from yesterday
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  console.log("[STREAK] No submission today, checking from yesterday:", yesterdayStr);
  
  while (daySet.has(yesterday.toISOString().slice(0, 10))) {
    streak += 1;
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  }

  console.log("[STREAK] Final calculated streak:", streak);
  return streak;
}

function buildHeatmap(allSubmissions, year) {
  const dailyCount = new Map();
  
  // Handle empty submissions array
  if (!allSubmissions || allSubmissions.length === 0) {
    console.log("[HEATMAP] No submissions, returning empty heatmap for year:", year);
  } else {
    allSubmissions.forEach((submission) => {
      if (submission && submission.createdAt) {
        const key = new Date(submission.createdAt).toISOString().slice(0, 10);
        dailyCount.set(key, (dailyCount.get(key) || 0) + 1);
      }
    });
  }

  const values = [];
  
  // Build heatmap for the specified year (Jan 1 to Dec 31)
  const startDate = new Date(year, 0, 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(year, 11, 31);
  endDate.setHours(0, 0, 0, 0);

  for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    const key = day.toISOString().slice(0, 10);
    const count = dailyCount.get(key) || 0;

    let level = 0;
    if (count >= 8) level = 5;
    else if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    values.push(level);
  }

  return values;
}

function normalizeUrl(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const getProfile = async (req, res) => {
  try {
    console.log("[PROFILE API] Fetching profile for user:", req.user._id);
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear(); // Get year from query param, default to current year

    const [submissions, solvedProblems] = await Promise.all([
      Submission.find({ userId })
        .select("problemId status createdAt")
        .populate("problemId", "title difficulty tags")
        .sort({ createdAt: -1 })
        .lean(),
      Problem.find({ _id: { $in: req.user.problemSolved || [] } })
        .select("difficulty tags title")
        .lean(),
    ]);

    console.log("[PROFILE API] User has", submissions.length, "total submissions");
    console.log("[PROFILE API] User has solved", solvedProblems.length, "problems");

    const acceptedSubmissions = submissions.filter((submission) => submission.status === "accepted");
    const solvedByDifficulty = solvedProblems.reduce(
      (acc, problem) => {
        if (problem.difficulty === "Easy") acc.easy += 1;
        if (problem.difficulty === "Medium") acc.medium += 1;
        if (problem.difficulty === "Hard") acc.hard += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    const solvedCount = solvedProblems.length;
    
    // Create set of submission dates (in UTC YYYY-MM-DD format)
    const daySet = new Set();
    acceptedSubmissions.forEach((submission) => {
      if (submission && submission.createdAt) {
        const dateStr = new Date(submission.createdAt).toISOString().slice(0, 10);
        daySet.add(dateStr);
      }
    });
    
    const currentStreak = computeStreak(daySet);
    
    console.log("[STREAK DEBUG] Total submissions:", submissions.length);
    console.log("[STREAK DEBUG] Accepted submissions count:", acceptedSubmissions.length);
    console.log("[STREAK DEBUG] Recent accepted submissions:", 
      acceptedSubmissions.slice(0, 5).map(s => ({ 
        date: s.createdAt, 
        dateStr: new Date(s.createdAt).toISOString().slice(0, 10),
        problem: s.problemId?.title 
      }))
    );
    console.log("[STREAK DEBUG] Unique days with submissions:", Array.from(daySet).sort().reverse());
    console.log("[STREAK DEBUG] Calculated streak:", currentStreak);

    const ratingBase = 1200;
    const rating = Math.min(3000, ratingBase + solvedCount * 2 + solvedByDifficulty.hard * 10 + acceptedSubmissions.length);
    const rank = Math.max(1, 50000 - rating * 10);

    const contestPerformance = [
      7, 6, 5, 4, 3, 2, 1, 0,
    ]
      .map((monthOffset, idx) => {
        const start = new Date();
        start.setMonth(start.getMonth() - monthOffset);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);

        const monthAccepted = acceptedSubmissions.filter((submission) => {
          const created = new Date(submission.createdAt);
          return created >= start && created < end;
        }).length;

        return {
          contest: `C${idx + 1}`,
          rating: Math.min(3000, ratingBase + monthAccepted * 8 + idx * 35 + solvedCount),
        };
      });

    const tagCounter = solvedProblems.reduce((acc, problem) => {
      const tag = (problem.tags || "").toLowerCase();
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const topicScore = {
      Arrays: Math.min(100, 35 + (tagCounter.array || 0) * 10 + (tagCounter["two pointer"] || 0) * 6 + (tagCounter["sliding window"] || 0) * 6),
      "Dynamic Programming": Math.min(100, 30 + (tagCounter["dynamic programming"] || 0) * 12),
      Graphs: Math.min(100, 30 + (tagCounter.graph || 0) * 12),
      Trees: Math.min(100, 30 + (tagCounter.recursion || 0) * 8),
      Greedy: Math.min(100, 28 + (tagCounter["binary-search"] || 0) * 7),
      Strings: Math.min(100, 30 + solvedCount * 0.2),
    };

    const recentActivity = submissions.slice(0, 10).map((submission) => {
      const problemTitle = submission.problemId?.title || "a problem";
      const createdAt = submission.createdAt || new Date();
      
      if (submission.status === "accepted") {
        return {
          time: formatRelativeTime(createdAt),
          text: `Solved \"${problemTitle}\"`,
          type: "solve",
        };
      }

      return {
        time: formatRelativeTime(createdAt),
        text: `Submitted \"${problemTitle}\" (${submission.status})`,
        type: "submission",
      };
    });

    const badges = [
      { name: "First Problem Solved", icon: "🎯", earned: solvedCount >= 1 },
      { name: "7 Day Streak", icon: "🔥", earned: currentStreak >= 7 },
      { name: "50 Problems Solved", icon: "💡", earned: solvedCount >= 50 },
      { name: "Hard Problem Slayer", icon: "⚔️", earned: solvedByDifficulty.hard >= 10 },
      { name: "Contest Winner", icon: "🏆", earned: rating >= 1800 },
    ];

    const fullName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Kodolio User";
    const profileUsername = req.user.username || (req.user.emailId ? req.user.emailId.split("@")[0] : "coder");
    const profileAvatar = req.user.avatar || `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(fullName)}`;
    const followers = Math.max(20, Math.round(solvedCount * 2.1));
    const following = Math.max(10, Math.round(solvedCount * 0.7));
    const friends = Math.max(5, Math.round(solvedCount * 0.35));

    return res.status(200).json({
      success: true,
      profile: {
        firstName: req.user.firstName || "",
        lastName: req.user.lastName || "",
        username: profileUsername,
        name: fullName,
        avatar: profileAvatar,
        bio: req.user.bio || "Competitive programmer on Kodolio",
        location: req.user.location || "India",
        joined: new Date(req.user.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" }),
        github: req.user.github || "",
        linkedin: req.user.linkedin || "",
        portfolio: req.user.portfolio || "",
        shareProfile: req.user.shareProfile || "",
        rating,
        rank,
        streak: currentStreak,
        solved: solvedCount,
        followers,
        following,
        friends,
      },
      codingStats: {
        totalSolved: solvedCount,
        easySolved: solvedByDifficulty.easy,
        mediumSolved: solvedByDifficulty.medium,
        hardSolved: solvedByDifficulty.hard,
        contestRating: rating,
        maxStreak: currentStreak,
        totalContestsParticipated: Math.max(0, contestPerformance.length - 1),
      },
      heatmapValues: buildHeatmap(submissions, year),
      badges,
      projects: [],
      recentActivity,
      contestPerformance,
      skillRadar: [
        { topic: "Arrays", value: topicScore.Arrays },
        { topic: "Dynamic Programming", value: topicScore["Dynamic Programming"] },
        { topic: "Graphs", value: topicScore.Graphs },
        { topic: "Trees", value: topicScore.Trees },
        { topic: "Greedy", value: topicScore.Greedy },
        { topic: "Strings", value: topicScore.Strings },
      ],
      social: {
        followers,
        following,
        friends,
      },
      tabs: {
        solutions: acceptedSubmissions.slice(0, 8).map((submission) => submission.problemId?.title).filter(Boolean),
        posts: [],
        contests: contestPerformance.map((item) => `${item.contest} rating ${item.rating}`),
        projects: [],
      },
      goal: {
        current: solvedCount,
        target: req.user.goalTarget || 500,
      },
    });
    console.log("[PROFILE API] Profile sent successfully for user:", req.user._id);
  } catch (err) {
    console.error("[PROFILE API] Error generating profile:", err);
    console.error("[PROFILE API] User:", req.user._id);
    console.error("[PROFILE API] Stack:", err.stack);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      avatar,
      bio,
      location,
      github,
      linkedin,
      portfolio,
      shareProfile,
      goalTarget,
    } = req.body;

    const updates = {};

    if (typeof firstName === "string" && firstName.trim()) updates.firstName = firstName.trim();
    if (typeof lastName === "string") updates.lastName = lastName.trim();
    if (typeof username === "string") updates.username = username.trim();
    if (typeof avatar === "string") updates.avatar = avatar.trim();
    if (typeof bio === "string") updates.bio = bio.trim().slice(0, 240);
    if (typeof location === "string") updates.location = location.trim().slice(0, 80);
    if (typeof github === "string") updates.github = normalizeUrl(github);
    if (typeof linkedin === "string") updates.linkedin = normalizeUrl(linkedin);
    if (typeof portfolio === "string") updates.portfolio = normalizeUrl(portfolio);
    if (typeof shareProfile === "string") updates.shareProfile = normalizeUrl(shareProfile);

    if (goalTarget !== undefined) {
      const parsedGoal = Number(goalTarget);
      if (!Number.isNaN(parsedGoal)) {
        updates.goalTarget = Math.max(1, Math.min(10000, Math.trunc(parsedGoal)));
      }
    }

    const updatedUser = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailId: updatedUser.emailId,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
