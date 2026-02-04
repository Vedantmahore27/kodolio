import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'; 
import HeaderPage from "../pages/Header"
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import logo from '../assets/logo.png';

function ProblemPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });
  const ITEMS_PER_PAGE = 10;

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
    return difficultyMatch && tagMatch && statusMatch;
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
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 mt-8 items-center">
          {/* New Status Filter */}
          <select 
            className="select select-bordered"
            style={{backgroundColor: '#1a1a2e', color: '#a855f7', borderColor: '#a855f7'}}
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className="select select-bordered"
            style={{backgroundColor: '#1a1a2e', color: '#a855f7', borderColor: '#a855f7'}}
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            className="select select-bordered"
            style={{backgroundColor: '#1a1a2e', color: '#a855f7', borderColor: '#a855f7'}}
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="binary-search">Binary Search</option>
            <option value="linkedlist">Linked List</option>
            <option value="sliding window">Sliding Window</option>
            <option value="stack">Stack</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="graph">Graph</option>
            
          </select>

          {/* Clear Filter Button */}
          <button 
            onClick={() => {
              setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(249, 115, 22, 0.3))',
              border: '1px solid #f97316'
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Problems Table */}
        <div className="rounded-xl overflow-hidden shadow-2xl" style={{backgroundColor: '#1a1a2e', border: '1px solid #a855f7'}}>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 font-bold text-white text-sm" style={{backgroundColor: 'linear-gradient(135deg, #a855f7, #f97316)', backgroundImage: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(249, 115, 22, 0.1))'}}>
            <div className="col-span-1 flex items-center justify-center">Status</div>
            <div className="col-span-5">Problem Name</div>
            <div className="col-span-3">Topic</div>
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
                  <div className="col-span-5 ">
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="text-purple-400 hover:text-orange-400 font-semibold transition-all duration-200 line-clamp-2 text-sm"
                    >
                      {problem.title}
                    </NavLink>
                  </div>

                  {/* Topic Column */}
                  <div className="col-span-3">
                    <span className="text-gray-200 text-xs bg-purple-800/30 px-3 py-1 rounded-full inline-block border border-purple-500/50 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,165,0,0.7)] transition-all duration-300">
                    {problem.tags}
                    </span>
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