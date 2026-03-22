import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'; 
import HeaderPage from "../pages/Header"
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import logo from '../assets/logo.png';
import { Filter, X, ChevronDown, CheckCircle, Zap, Target, Code2, Building2, BarChart3, RefreshCw } from 'lucide-react';

function ProblemPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    company: 'all'
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const ITEMS_PER_PAGE = 10;

  // Scroll to top when component mounts or when on problem page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

useEffect(() => {
  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data.problems || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSolvedProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/problemSolvedByUser');
      setSolvedProblems(data.solved || []);
    } catch (error) {
      console.error(error);
    }
  };

  fetchProblems();
  if (user) fetchSolvedProblems();
}, [user]);


  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    const companyMatch = filters.company === 'all' || 
                        (Array.isArray(problem.company) && problem.company.includes(filters.company));
    return difficultyMatch && tagMatch && statusMatch && companyMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedProblems = filteredProblems.slice(startIdx, endIdx);

  return (<>
     <HeaderPage></HeaderPage>
    <div className="min-h-screen" style={{backgroundColor: '#0f0f1e'}}>
      {/* Premium Header Navigation */}
     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced Filter Section */}
      <div className="mb-8 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300"
        style={{
          backgroundColor: 'rgba(168, 85, 247, 0.08)',
          borderColor: 'rgba(168, 85, 247, 0.2)',
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Filter size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
            <p className="text-xs text-gray-400">Use powerful filters to find your perfect problem</p>
          </div>
        </div>

        {/* Advanced Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              className="w-full group px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-between font-semibold text-sm"
              style={{
                backgroundColor: filters.status !== 'all' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: filters.status !== 'all' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{filters.status === 'all' ? 'All Status' : 'Solved Only'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'status' && (
              <div className="absolute top-full mt-2 left-0 right-0 border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden z-50" style={{ backgroundColor: 'rgba(30, 20, 50, 0.9)' }}>
                <button
                  onClick={() => {
                    setFilters({...filters, status: 'all'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-purple-600/30 transition-colors border-b border-gray-700"
                >
                  All Problems
                </button>
                <button
                  onClick={() => {
                    setFilters({...filters, status: 'solved'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-purple-600/30 transition-colors"
                >
                  Solved Only
                </button>
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
              className="w-full group px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-between font-semibold text-sm"
              style={{
                backgroundColor: filters.difficulty !== 'all' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: filters.difficulty !== 'all' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span>{filters.difficulty === 'all' ? 'All Levels' : filters.difficulty}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === 'difficulty' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'difficulty' && (
              <div className="absolute top-full mt-2 left-0 right-0 border border-blue-500/30 rounded-lg shadow-2xl overflow-hidden z-50" style={{ backgroundColor: 'rgba(30, 20, 50, 0.9)' }}>
                <button
                  onClick={() => {
                    setFilters({...filters, difficulty: 'all'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-blue-600/30 transition-colors border-b border-gray-700"
                >
                  All Difficulties
                </button>
                <button
                  onClick={() => {
                    setFilters({...filters, difficulty: 'Easy'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-green-400 hover:bg-green-600/20 transition-colors border-b border-gray-700"
                >
                  Easy
                </button>
                <button
                  onClick={() => {
                    setFilters({...filters, difficulty: 'Medium'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-600/20 transition-colors border-b border-gray-700"
                >
                  Medium
                </button>
                <button
                  onClick={() => {
                    setFilters({...filters, difficulty: 'Hard'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600/20 transition-colors"
                >
                  Hard
                </button>
              </div>
            )}
          </div>

          {/* Problem Type Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'tag' ? null : 'tag')}
              className="w-full group px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-between font-semibold text-sm"
              style={{
                backgroundColor: filters.tag !== 'all' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: filters.tag !== 'all' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-2">
                <Code2 size={16} />
                <span>{filters.tag === 'all' ? 'All Types' : filters.tag.charAt(0).toUpperCase() + filters.tag.slice(1)}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === 'tag' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'tag' && (
              <div className="absolute top-full mt-2 left-0 right-0 border border-green-500/30 rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50" style={{ backgroundColor: 'rgba(30, 20, 50, 0.9)' }}>
                <button
                  onClick={() => {
                    setFilters({...filters, tag: 'all'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-green-600/30 transition-colors border-b border-gray-700"
                >
                  All Types
                </button>
                {['array', 'binary-search', 'linkedlist', 'recursion', 'queues', 'two pointer', 'sliding window', 'stack', 'Dynamic Programming', 'graph'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilters({...filters, tag});
                      setOpenDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-green-600/20 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    {tag === 'array' && 'Array'}
                    {tag === 'binary-search' && 'Binary Search'}
                    {tag === 'linkedlist' && 'Linked List'}
                    {tag === 'recursion' && 'Recursion'}
                    {tag === 'queues' && 'Queues'}
                    {tag === 'two pointer' && 'Two Pointer'}
                    {tag === 'sliding window' && 'Sliding Window'}
                    {tag === 'stack' && 'Stack'}
                    {tag === 'Dynamic Programming' && 'Dynamic Programming'}
                    {tag === 'graph' && 'Graph'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Company Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
              className="w-full group px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-between font-semibold text-sm"
              style={{
                backgroundColor: filters.company !== 'all' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: filters.company !== 'all' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{filters.company === 'all' ? 'All Companies' : filters.company}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === 'company' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'company' && (
              <div className="absolute top-full mt-2 left-0 right-0 border border-orange-500/30 rounded-lg shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50" style={{ backgroundColor: 'rgba(30, 20, 50, 0.9)' }}>
                <button
                  onClick={() => {
                    setFilters({...filters, company: 'all'});
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-orange-600/30 transition-colors border-b border-gray-700"
                >
                  All Companies
                </button>
                {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'LinkedIn', 'Tesla', 'Uber', 'Adobe'].map(company => (
                  <button
                    key={company}
                    onClick={() => {
                      setFilters({...filters, company});
                      setOpenDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-orange-600/20 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons & Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-400" />
            Showing <span className="font-bold text-white">{filteredProblems.length}</span> problems
          </div>
          <button 
            onClick={() => {
              setFilters({ difficulty: 'all', tag: 'all', status: 'all', company: 'all' });
              setCurrentPage(1);
              setOpenDropdown(null);
            }}
            className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(249, 115, 22, 0.3))',
              border: '1px solid #f97316'
            }}
          >
            <RefreshCw size={16} />
            Clear Filters
          </button>
        </div>
      </div>

        {/* Problems Table */}
        <div className="rounded-xl overflow-hidden shadow-2xl" style={{backgroundColor: '#1a1a2e', border: '1px solid #a855f7'}}>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 font-bold text-white text-sm" style={{backgroundColor: 'linear-gradient(135deg, #a855f7, #f97316)', backgroundImage: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(249, 115, 22, 0.1))'}}>
            <div className="col-span-1 flex items-center justify-center">Status</div>
            <div className="col-span-4">Problem Name</div>
            <div className="col-span-2">Topic</div>
            <div className="col-span-2">Companies</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-1 flex items-center justify-center">Action</div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-blue-500/20">
            {paginatedProblems.length > 0 ? (
              paginatedProblems.map((problem, idx) => (
                <div 
                  key={problem._id}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-purple-900/20 transition-all duration-300 border-l-4"
                  style={{borderLeftColor: '#a855f7'}}
                >
                  {/* Status Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    {solvedProblems.some(sp => sp._id === problem._id) ? (
                      <div className="text-xl text-green-400">✓</div>
                    ) : (
                      <div className="text-xl text-gray-400">○</div>
                    )}
                  </div>

                  {/* Problem Name Column */}
                  <div className="col-span-4 ">
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="text-purple-400 hover:text-orange-400 font-semibold transition-all duration-200 line-clamp-2 text-sm"
                    >
                      {problem.title}
                    </NavLink>
                  </div>

                  {/* Topic Column */}
                  <div className="col-span-2">
                    <span className="text-gray-200 text-xs bg-purple-800/30 px-3 py-1 rounded-full inline-block border border-purple-500/50 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,165,0,0.7)] transition-all duration-300">
                    {problem.tags}
                    </span>
                  </div>

                  {/* Companies Column */}
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(problem.company) && problem.company.length > 0 ? (
                        problem.company.slice(0, 2).map((company) => (
                          <span 
                            key={company}
                            className="text-xs font-semibold px-2 py-1 rounded-full inline-block border border-orange-500/50 bg-orange-900/30 text-orange-400 hover:scale-105 transition-all duration-300"
                          >
                            {company}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                      {Array.isArray(problem.company) && problem.company.length > 2 && (
                        <span className="text-xs text-gray-400 px-2 py-1">+{problem.company.length - 2}</span>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Column */}
                  <div className="col-span-2">
                    <span 
                      className="text-xs font-bold font-size px-3  py-2 rounded-full inline-block  border-purple-500/50 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,165,0,0.7)] transition-all duration-300"
                      style={{color: getDifficultyBadgeColor(problem.difficulty), backgroundColor: 'transparent'}}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Action Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="text-orange-400 hover:text-orange-300 transition-all duration-300 font-bold text-lg"
                    >
                      →
                    </NavLink>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-12 p-8 text-center text-gray-400 text-sm">
                No problems found matching your filters.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {/* Previous Button */}
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentPage === 1 ? '#333' : '',
                boxShadow: currentPage === 1 ? 'none' : '0 0 17px rgba(14, 165, 234, 0.8)'
              }}
            >
              ← 
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  currentPage === page 
                    ? 'text-white shadow-lg shadow-blue-500/50' 
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{
                  background: currentPage === page 
                    ? '' 
                    : 'transparent',
                  border: currentPage === page ? '1px solid #0ea5e9' : 'none'
                }}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg  text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: currentPage === totalPages ? '#333' : "",
                boxShadow: currentPage === totalPages ? 'none' : '0 0 17px rgba(14, 165, 234, 0.8)'
              }}
            >
             →
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {

    case 'easy': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#6b7280';
  }
};

export default ProblemPage;