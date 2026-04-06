import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';
import { Menu, X, Flame } from 'lucide-react';
import logo from '../assets/logo.png';
import image from "../assets/image.png"
import axiosClient from '../utils/axiosClient';
import pro from "../assets/problem.png"
import contest from "../assets/contest.png"
import discussion from "../assets/discussion.png"
import admin from "../assets/admin.png"



const HeaderPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cachedAvatar, setCachedAvatar] = useState(() => {
    // Initialize from localStorage
    try {
      return localStorage.getItem('userAvatarCache') || null;
    } catch {
      return null;
    }
  });
  const [cachedStreak, setCachedStreak] = useState(() => {
    // Initialize cached streak from localStorage
    try {
      const cached = localStorage.getItem('userStreakCache');
      return cached ? parseInt(cached, 10) : 0;
    } catch {
      return 0;
    }
  });
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user profile to get avatar
  const fetchProfile = useCallback(async () => {
    // Prevent duplicate simultaneous requests
    if (fetchInProgressRef.current) {
      console.log("[HEADER] Profile fetch already in progress, skipping");
      return;
    }

    if (!isAuthenticated || !user?._id) {
      return;
    }

    fetchInProgressRef.current = true;
    try {
      console.log("[HEADER] Fetching profile for user:", user._id);
      const res = await axiosClient.get("/user/profile");
      console.log("[HEADER] Profile fetched successfully:", res.data);
      
      if (isMountedRef.current && res.data?.success && res.data?.profile) {
        console.log("[HEADER] Setting userProfile:", res.data.profile);
        setUserProfile(res.data.profile);
        
        // Cache streak to localStorage for persistence across navigation
        if (res.data.profile.streak !== undefined) {
          console.log("[HEADER] Caching streak:", res.data.profile.streak);
          setCachedStreak(res.data.profile.streak);
          try {
            localStorage.setItem('userStreakCache', res.data.profile.streak.toString());
          } catch (e) {
            console.log("[HEADER] Could not save streak to localStorage:", e);
          }
        }
        
        // Cache avatar URL to prevent flickering on navigation
        if (res.data.profile.avatar) {
          console.log("[HEADER] Setting cachedAvatar to:", res.data.profile.avatar);
          setCachedAvatar(res.data.profile.avatar);
          // Also save to localStorage for persistence
          try {
            localStorage.setItem('userAvatarCache', res.data.profile.avatar);
          } catch (e) {
            console.log("[HEADER] Could not save to localStorage:", e);
          }
        }
      } else {
        console.warn("[HEADER] Invalid profile response:", res.data);
      }
    } catch (err) {
      console.error("[HEADER] Failed to fetch profile:", err);
      console.error("[HEADER] Error details:", err.response?.data);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [isAuthenticated, user?._id]);

  // Fetch profile once on mount or when user changes
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isAuthenticated && user?._id) {
      console.log("[HEADER] Triggering profile fetch on mount/user change");
      fetchProfile();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthenticated, user?._id, fetchProfile]);

  // Listen for profile update events (triggered after successful submission)
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (isAuthenticated && user?._id) {
        try {
          console.log("[HEADER] Refreshing profile after submission");
          const res = await axiosClient.get("/user/profile");
          if (isMountedRef.current && res.data?.success && res.data?.profile) {
            console.log("[HEADER] New profile data:", res.data.profile);
            setUserProfile(res.data.profile);
            
            // Cache streak to localStorage for persistence across navigation
            if (res.data.profile.streak !== undefined) {
              console.log("[HEADER] Caching updated streak:", res.data.profile.streak);
              setCachedStreak(res.data.profile.streak);
              try {
                localStorage.setItem('userStreakCache', res.data.profile.streak.toString());
              } catch (e) {
                console.log("[HEADER] Could not save streak to localStorage:", e);
              }
            }
            
            // Always update cachedAvatar with the latest avatar from server
            if (res.data.profile.avatar) {
              console.log("[HEADER] Setting cachedAvatar to:", res.data.profile.avatar);
              setCachedAvatar(res.data.profile.avatar);
              // Also save to localStorage for persistence
              try {
                localStorage.setItem('userAvatarCache', res.data.profile.avatar);
              } catch (e) {
                console.log("[HEADER] Could not save to localStorage:", e);
              }
            }
            console.log("[HEADER] Profile refreshed, new streak:", res.data.profile.streak);
          }
        } catch (err) {
          console.error("[HEADER] Failed to refresh profile:", err);
        }
      }
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
  }, [isAuthenticated, user?._id]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };
console.log("HEADER user:", user);
console.log("HEADER role:", user?.role);
console.log("HEADER userProfile:", userProfile);
  return (
    <header className="relative z-20 backdrop-blur-md bg-purple-950/20 border-b border-purple-500/20">
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center h-14 sm:h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <img
              src={logo}
              className="w-24 sm:w-32 md:w-40 h-auto object-contain hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.9)] transition-all duration-300"
              alt="logo"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center w-full">

            {/* Left Navigation Links */}
            <div className="flex items-center space-x-6 lg:space-x-12 ml-auto lg:ml-70">
              <NavLink
                 to="/problems"
                 className={({ isActive }) =>
                   `flex items-center gap-2 font-medium transition-colors ${
                     isActive
                       ? "text-purple-400"
                       : "text-gray-300 hover:text-purple-400"
                   }`
                 }
               >
                 <img
                   src={pro}
                   alt=""
                   className="w-5 h-5 object-contain"
                 />
                 <span>Problems</span>
               </NavLink>


              <NavLink
                 to="/contest"
                 className={({ isActive }) =>
                   `flex items-center gap-2 font-medium transition-colors ${
                     isActive
                       ? "text-orange-400"
                       : "text-gray-300 hover:text-orange-400"
                   }`
                 }
               >
                 <img
                   src={contest}
                   alt=""
                   className="w-5 h-5 object-contain"
                 />
                 <span>Contests</span>
               </NavLink>

              <NavLink
                 to="/discussion"
                 className={({ isActive }) =>
                   `flex items-center gap-2 font-medium transition-colors ${
                     isActive
                       ? "text-purple-400"
                       : "text-gray-300 hover:text-purple-400"
                   }`
                 }
               >
                 <img
                   src={discussion}
                   alt=""
                   className="w-5 h-5 object-contain"
                 />
                 <span>Discussion</span>
               </NavLink>
            </div>
           
            {/* Right Side */}
            <div className="flex items-center ml-auto lg:ml-50">
                {isAuthenticated && user?.role === "admin" && (
                   <>
                   <NavLink
                    to="/admin"
                    className={({ isActive }) =>  `flex items-center gap-2 font-medium transition-colors ${
                    isActive ? "text-purple-400" : "text-gray-300 hover:text-purple-400"
                    }`
                   }
               >
                 <img
                   src={admin}
                   alt=""
                   className="w-5 h-5 object-contain"
                 />
                 <span>Admin</span>
               </NavLink>
                   </>
                  )}
             </div>

            <div className="ml-auto relative flex items-center gap-1.5 md:gap-2 lg:gap-3 pl-2 sm:pl-3 md:pl-4 lg:pl-6">
              {isAuthenticated ? (
                <>
                  {/* Streak Indicator */}
                  <div className={`hidden sm:inline-flex items-center gap-1.5 mr-2 md:mr-3 px-2 md:px-3 py-1 md:py-1.5 rounded-full border text-xs md:text-sm ${
                    (cachedStreak && cachedStreak > 0) 
                      ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                      : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
                  }`}>
                    <Flame size={14} className={
                      (cachedStreak && cachedStreak > 0)
                        ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                        : 'text-slate-600'
                    } />
                    <span className="text-xs md:text-sm font-semibold tabular-nums">
                      {cachedStreak || 0}
                    </span>
                  </div>

                  {/* Profile Avatar */}
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 hover:scale-105 transition"
                    title="Profile menu"
                  >
                    <img
                      key={cachedAvatar || userProfile?.avatar || 'default'}
                      src={cachedAvatar || userProfile?.avatar || image}
                      alt="profile"
                      onError={(e) => {
                        // Fallback if avatar URL is broken
                        console.log("[HEADER] Avatar image failed to load, using fallback");
                        e.target.src = image;
                      }}
                      className="w-full h-full object-cover"
                      style={{ backgroundColor: '#4c1d95' }}
                    />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-purple-950 border border-purple-500/30 rounded-xl shadow-lg overflow-hidden z-50">
                      <NavLink
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-gray-300 hover:bg-purple-800/40"
                      >
                        Profile
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-purple-800/40"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) :  (
              <>
                <NavLink
                  to="/login"
                  className="px-2.5 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-lg font-medium transition-all text-purple-400 border border-purple-900/40 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 hover:text-purple-300 text-xs sm:text-sm"
                  style={{
                    textShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = '0 0 8px rgba(168, 85, 247, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-2.5 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-lg font-medium transition-all text-orange-400 border border-orange-900/40 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 hover:text-orange-300 text-xs sm:text-sm"
                  style={{
                    textShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = '0 0 8px rgba(249, 115, 22, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  Sign Up
                </NavLink>
              </>
            )}
            </div>
          </div>
         
          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            {/* Mobile Streak Indicator (visible in header) */}
            {isAuthenticated && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                (cachedStreak && cachedStreak > 0) 
                  ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                  : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
              }`}>
                <Flame size={14} className={
                  (cachedStreak && cachedStreak > 0)
                    ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                    : 'text-slate-600'
                } />
                <span className="text-xs font-semibold tabular-nums">
                  {cachedStreak || 0}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-purple-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-purple-500/20 mt-2">
            <NavLink
              to="/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-purple-400"
            >
              Problems
            </NavLink>

            <NavLink
              to="/contests"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-orange-400"
            >
              Contests
            </NavLink>

            <NavLink
              to="/discussion"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-purple-400"
            >
              Discussions
            </NavLink>

            {isAuthenticated ? (
              <>
                {/* Streak Indicator - Mobile */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                  (cachedStreak && cachedStreak > 0) 
                    ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                    : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
                }`}>
                  <Flame size={18} className={
                    (cachedStreak && cachedStreak > 0)
                      ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                      : 'text-slate-600'
                  } />
                  <span className="text-sm font-semibold tabular-nums">
                    {cachedStreak || 0} Day Streak
                  </span>
                </div>

                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-orange-400"
                >
                  Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-2 rounded-lg font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #f97316)",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-medium text-purple-400 border border-purple-900/40 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 hover:text-purple-300 transition-all text-sm text-center"
                  style={{
                    textShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = '0 0 8px rgba(168, 85, 247, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg font-medium text-orange-400 border border-orange-900/40 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 hover:text-orange-300 transition-all text-sm text-center"
                  style={{
                    textShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = '0 0 8px rgba(249, 115, 22, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderPage;

