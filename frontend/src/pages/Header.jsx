import { useState, useEffect } from 'react';
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

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user profile to get avatar
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const fetchProfile = async () => {
        try {
          console.log("[HEADER] Fetching profile for user:", user._id);
          const res = await axiosClient.get("/user/profile");
          console.log("[HEADER] Profile fetched successfully:", res.data);
          if (res.data?.success && res.data?.profile) {
            setUserProfile(res.data.profile);
          } else {
            console.warn("[HEADER] Invalid profile response:", res.data);
          }
        } catch (err) {
          console.error("[HEADER] Failed to fetch profile:", err);
          console.error("[HEADER] Error details:", err.response?.data);
        }
      };
      fetchProfile();
    }
  }, [isAuthenticated, user?._id]);

  // Listen for profile update events (triggered after successful submission)
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (isAuthenticated && user?._id) {
        try {
          console.log("[HEADER] Refreshing profile after submission");
          const res = await axiosClient.get("/user/profile");
          if (res.data?.success && res.data?.profile) {
            setUserProfile(res.data.profile);
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
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 ">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <img
              src={logo}
              className="w-40 h-auto object-contain hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.9)] transition-all duration-300"
              alt="logo"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center w-full">

            {/* Left Navigation Links */}
            <div className="flex items-center space-x-12 ml-70">
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
                 to="/dicussion"
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
            <div className="flex items-center ml-50">
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

            <div className="ml-auto relative flex items-center">
              {isAuthenticated ? (
                <>
                  {/* Streak Indicator */}
                  <div className={`inline-flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-full border transition-all ${
                    (userProfile?.streak && userProfile.streak > 0) 
                      ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                      : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
                  }`}>
                    <Flame size={16} className={
                      (userProfile?.streak && userProfile.streak > 0)
                        ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                        : 'text-slate-600'
                    } />
                    <span className="text-sm font-semibold">
                      {userProfile?.streak || 0}
                    </span>
                  </div>

                  {/* Profile Avatar */}
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 hover:scale-105 transition"
                  >
                    <img
                      src={userProfile?.avatar || user?.avatar || image}
                      alt="profile"
                      className="w-full h-full object-cover"
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
                  className="px-6 py-1 rounded-lg font-semibold text-purple-400 border-2 border-orange-400 hover:bg-orange-400/20 transition-all duration-300"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-5 py-1 rounded-lg font-semibold text-orange-400 border-2 border-purple-400 hover:bg-purple-400/20 transition-all duration-300 ml-5"
                  style={{
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
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
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                (userProfile?.streak && userProfile.streak > 0) 
                  ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                  : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
              }`}>
                <Flame size={14} className={
                  (userProfile?.streak && userProfile.streak > 0)
                    ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                    : 'text-slate-600'
                } />
                <span className="text-xs font-semibold">
                  {userProfile?.streak || 0}
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
              to="/discussions"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-purple-400"
            >
              Discussions
            </NavLink>

            {isAuthenticated ? (
              <>
                {/* Streak Indicator - Mobile */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  (userProfile?.streak && userProfile.streak > 0) 
                    ? 'bg-linear-to-r from-orange-500/20 to-amber-500/20 border-orange-400/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                    : 'bg-slate-800/40 border-slate-600/30 text-slate-500'
                }`}>
                  <Flame size={18} className={
                    (userProfile?.streak && userProfile.streak > 0)
                      ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]'
                      : 'text-slate-600'
                  } />
                  <span className="text-sm font-semibold">
                    {userProfile?.streak || 0} Day Streak
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
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-purple-400 font-semibold"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-orange-400 font-semibold"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderPage;

