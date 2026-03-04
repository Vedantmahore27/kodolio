import { Trophy, Calendar, Users, Zap } from 'lucide-react';
import HeaderPage from './Header';

const Contest = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.15),transparent_40%)]" />
      <div className="pointer-events-none absolute top-20 left-10 w-64 h-64 bg-linear-to-br from-violet-600/10 to-purple-500/5 rounded-3xl rotate-12 blur-2xl" />
      <div className="pointer-events-none absolute top-40 right-20 w-80 h-80 bg-linear-to-br from-orange-600/10 to-amber-500/5 rounded-3xl -rotate-12 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.06)_1px,transparent_1px)] bg-size-[38px_38px] opacity-30" />

      <HeaderPage />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-8">
          {/* Trophy Icon with Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-orange-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-linear-to-br from-violet-600/20 to-orange-600/20 p-8 rounded-full border-2 border-violet-500/30">
              <Trophy size={80} className="text-orange-400 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Coming Soon Text */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-400 via-fuchsia-400 to-orange-400">
              Coming Soon
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-slate-300">
              Contests
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Get ready for exciting coding competitions! Test your skills against other developers, 
            climb the leaderboard, and win amazing prizes.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <div className="p-6 rounded-xl border border-violet-500/20 bg-slate-900/70 backdrop-blur-sm hover:border-violet-500/40 transition-all">
              <Calendar className="w-10 h-10 text-violet-400 mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Weekly Contests</h3>
              <p className="text-sm text-slate-400">Compete every week with fresh challenges</p>
            </div>

            <div className="p-6 rounded-xl border border-orange-500/20 bg-slate-900/70 backdrop-blur-sm hover:border-orange-500/40 transition-all">
              <Users className="w-10 h-10 text-orange-400 mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Real-time Rankings</h3>
              <p className="text-sm text-slate-400">Watch your rank update as you solve</p>
            </div>

            <div className="p-6 rounded-xl border border-violet-500/20 bg-slate-900/70 backdrop-blur-sm hover:border-violet-500/40 transition-all">
              <Zap className="w-10 h-10 text-violet-400 mb-3" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Instant Feedback</h3>
              <p className="text-sm text-slate-400">Get instant results for your submissions</p>
            </div>
          </div>

          {/* Notification Signup */}
          <div className="mt-12 p-8 rounded-2xl border border-violet-500/20 bg-slate-900/70 backdrop-blur-sm max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Stay Tuned!</h3>
            <p className="text-slate-400 mb-6">
              We're working hard to bring you an amazing contest experience. Follow us for updates!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-violet-500/30 bg-slate-800/60 text-slate-100 placeholder-slate-500 focus:border-orange-400 focus:outline-none"
                disabled
              />
              <button
                disabled
                className="px-8 py-3 rounded-lg font-semibold text-white bg-linear-to-r from-violet-600 to-orange-600 opacity-50 cursor-not-allowed"
              >
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contest;
