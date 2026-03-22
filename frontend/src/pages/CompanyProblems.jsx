import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Filter, SortAsc, Zap, Target } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import HeaderPage from './Header';
import AnimatedBackground from './AnimatedBackground';

function CompanyProblems() {
    const { company } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('difficulty'); // difficulty, submissions, etc.
    const [filterDifficulty, setFilterDifficulty] = useState('All');

    // Company colors mapping
    const companyColors = {
        google: { color: '#4285F4', bgColor: '#1a2847' },
        amazon: { color: '#FF9900', bgColor: '#2a2416' },
        microsoft: { color: '#00A4EF', bgColor: '#162842' },
        oracle: { color: '#F80000', bgColor: '#402020' },
        apple: { color: '#555555', bgColor: '#facc15' },
        ibm: { color: '#3a1b4f', bgColor: '#151d38' },
        meta: { color: '#1877F2', bgColor: '#141d3a' },
        airbnb: { color: '#FF5A5F', bgColor: '#2a1820' },
        netflix: { color: '#E50914', bgColor: '#1a0f0f' },
        linkedin: { color: '#0077B5', bgColor: '#0a1f2e' },
    };

    const companyColor = companyColors[company?.toLowerCase()] || { color: '#a855f7', bgColor: '#1a1a2e' };

    // Fetch problems for company
    const fetchProblems = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/problem/company/${company}`);
            
            // Fetch full problem details
            if (response.data.problems && Array.isArray(response.data.problems)) {
                const detailedProblems = await Promise.all(
                    response.data.problems.map(async (p) => {
                        try {
                            const detail = await axiosClient.get(`/problem/getProblemById/${p._id}`);
                            return detail.data.problem || p;
                        } catch (err) {
                            return p;
                        }
                    })
                );
                setProblems(detailedProblems);
            } else {
                setProblems([]);
            }
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load problems');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, [company]);

    // Filter problems
    const filteredProblems = problems.filter((p) => {
        if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) {
            return false;
        }
        return true;
    });

    // Sort problems
    const sortedProblems = [...filteredProblems].sort((a, b) => {
        if (sortBy === 'difficulty') {
            const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
            return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        } else if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'Medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'Hard':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen relative bg-gray-900">
            <AnimatedBackground />
            <HeaderPage />

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                {/* Back Button & Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </button>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-2">
                                Master {company}
                            </h1>
                            <p className="text-gray-400">
                                Practice {company} interview questions and prepare for your dream job
                            </p>
                        </div>
                        <div
                            className="px-6 py-3 rounded-xl text-center"
                            style={{
                                backgroundColor: `${companyColor.bgColor}80`,
                                border: `2px solid ${companyColor.color}40`,
                            }}
                        >
                            <div className="text-3xl font-bold" style={{ color: companyColor.color }}>
                                {sortedProblems.length}
                            </div>
                            <div className="text-xs text-gray-400">Problems</div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <span className="loading loading-spinner loading-lg" style={{ color: companyColor.color }}></span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Enhanced Filter & Sort Section - Always Visible */}
                        <div className="mb-8 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300"
                            style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                                borderColor: 'rgba(168, 85, 247, 0.2)',
                                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.1)'
                            }}
                        >
                            {/* Filter Title */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${companyColor.color}20` }}>
                                    <Filter size={20} style={{ color: companyColor.color }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Filter & Sort</h3>
                                    <p className="text-xs text-gray-400">Customize your problem view</p>
                                </div>
                            </div>

                            {/* Filter Controls Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Difficulty Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                        <Zap size={16} className="text-yellow-400" />
                                        Difficulty Level
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
                                            <button
                                                key={difficulty}
                                                onClick={() => setFilterDifficulty(difficulty)}
                                                className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                                                style={{
                                                    backgroundColor: filterDifficulty === difficulty 
                                                        ? difficulty === 'Easy' ? '#10b981' : difficulty === 'Medium' ? '#f59e0b' : difficulty === 'Hard' ? '#ef4444' : companyColor.color
                                                        : 'rgba(255, 255, 255, 0.05)',
                                                    color: filterDifficulty === difficulty ? 'white' : '#d1d5db',
                                                    border: filterDifficulty === difficulty ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    boxShadow: filterDifficulty === difficulty ? `0 0 15px ${difficulty === 'Easy' ? '#10b981' : difficulty === 'Medium' ? '#f59e0b' : difficulty === 'Hard' ? '#ef4444' : companyColor.color}40` : 'none',
                                                    fontWeight: filterDifficulty === difficulty ? '700' : '600',
                                                    opacity: filterDifficulty === difficulty ? 1 : 0.7
                                                }}
                                            >
                                                {difficulty}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Difficulty Stats */}
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                                            <div className="text-xl font-bold text-green-400">
                                                {problems.filter(p => p.difficulty === 'Easy').length}
                                            </div>
                                            <div className="text-xs text-gray-400">Easy</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                                            <div className="text-xl font-bold text-yellow-400">
                                                {problems.filter(p => p.difficulty === 'Medium').length}
                                            </div>
                                            <div className="text-xs text-gray-400">Medium</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                                            <div className="text-xl font-bold text-red-400">
                                                {problems.filter(p => p.difficulty === 'Hard').length}
                                            </div>
                                            <div className="text-xs text-gray-400">Hard</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sort Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                        <SortAsc size={16} style={{ color: companyColor.color }} />
                                        Sort By
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'difficulty', label: '📊 By Difficulty', desc: 'Easy → Medium → Hard' },
                                            { value: 'alphabetical', label: '🔤 Alphabetical', desc: 'A to Z' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setSortBy(option.value)}
                                                className={`w-full p-3 rounded-lg text-left transition-all duration-300 flex items-center gap-3 ${
                                                    sortBy === option.value
                                                        ? 'scale-102 shadow-lg'
                                                        : 'opacity-70 hover:opacity-100'
                                                }`}
                                                style={{
                                                    backgroundColor: sortBy === option.value
                                                        ? `${companyColor.color}30`
                                                        : 'rgba(255, 255, 255, 0.02)',
                                                    border: sortBy === option.value
                                                        ? `1px solid ${companyColor.color}60`
                                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                                    boxShadow: sortBy === option.value ? `0 0 15px ${companyColor.color}30` : 'none'
                                                }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full border-2"
                                                    style={{
                                                        borderColor: sortBy === option.value ? companyColor.color : '#9CA3AF',
                                                        backgroundColor: sortBy === option.value ? companyColor.color : 'transparent'
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-semibold text-white">{option.label}</div>
                                                    <div className="text-xs text-gray-400">{option.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(filterDifficulty !== 'All' || sortBy !== 'difficulty') && (
                                <div className="mt-6 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Target size={16} />
                                        <span>Applied filters:</span>
                                        {filterDifficulty !== 'All' && (
                                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                                                {filterDifficulty}
                                            </span>
                                        )}
                                        {sortBy !== 'difficulty' && (
                                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-medium">
                                                {sortBy === 'alphabetical' ? 'Alphabetical' : 'By Difficulty'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Problems Table or Empty State */}
                        {sortedProblems.length === 0 ? (
                            <div className="text-center py-12 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300"
                                style={{
                                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                                    borderColor: 'rgba(168, 85, 247, 0.2)',
                                    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.1)'
                                }}
                            >
                                <Target size={48} style={{ color: companyColor.color }} className="mx-auto mb-4 opacity-50" />
                                <p className="text-gray-400 text-lg mb-2">No problems found</p>
                                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or check back later</p>
                                <button
                                    onClick={() => {
                                        setFilterDifficulty('All');
                                        setSortBy('difficulty');
                                    }}
                                    className="px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${companyColor.color}, ${companyColor.color}cc)`
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sortedProblems.map((problem) => (
                                    <div
                                        key={problem._id}
                                        onClick={() => navigate(`/problem/${problem._id}`)}
                                        className="p-4 rounded-lg backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102"
                                        style={{
                                            backgroundColor: 'rgba(168, 85, 247, 0.05)',
                                            borderColor: 'rgba(168, 85, 247, 0.2)',
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-2">{problem.title}</h3>
                                                {problem.description && (
                                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                                        {problem.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                    {problem.tags && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                            {problem.tags}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ml-4 text-right whitespace-nowrap">
                                                <button
                                                    className="px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${companyColor.color}, ${companyColor.color}cc)`,
                                                    }}
                                                >
                                                    Solve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default CompanyProblems;
