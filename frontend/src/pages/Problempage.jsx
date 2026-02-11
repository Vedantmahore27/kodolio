import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import axiosClient from "../utils/axiosClient";
import Editorial from '../component/Editorial';

const SubmissionHistory = ({ problemId, onSelectSubmission, selectedSubmissionId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [problemId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/submission/submissions/${problemId}`);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'wrong':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'error':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'pending':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewCode = (submission) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setTimeout(() => setSelectedSubmission(null), 300);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-gray-400 text-sm mb-4">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No submissions yet. Submit your code to see the history here!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {submissions.map((submission) => (
        <div
          key={submission._id}
          className={`bg-gradient-to-r from-[#0f0f23] to-[#1a1a2e] border rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer ${
            selectedSubmissionId === submission._id ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700'
          }`}
          onClick={() => onSelectSubmission(submission)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusColor(submission.status)}`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500">{submission.language}</span>
              </div>
              <div className="text-sm text-gray-400">
                {submission.status === 'accepted' ? (
                  <span className="text-emerald-400">
                    ✓ {submission.testCasesPassed}/{submission.testCasesTotal} test cases passed
                  </span>
                ) : (
                  <span>
                    {submission.testCasesPassed}/{submission.testCasesTotal} test cases passed
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">{formatDate(submission.createdAt)}</div>
              {submission.runtime > 0 && (
                <div className="text-xs text-gray-600">
                  {submission.runtime.toFixed(2)}ms / {submission.memory}MB
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SubmissionDetails = ({ submission }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'wrong':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'error':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'pending':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!submission) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-gray-400 text-sm">
          Select a submission to view details
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white">Submission Details</h2>
        <p className="text-sm text-gray-400">{formatDate(submission.createdAt)}</p>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0f0f23] border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Status</p>
          <p className={`px-3 py-1.5 rounded text-sm font-semibold border inline-block ${getStatusColor(submission.status)}`}>
            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
          </p>
        </div>
        <div className="bg-[#0f0f23] border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Language</p>
          <p className="text-sm text-white font-medium">{submission.language}</p>
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Test Case Results</h3>
        <div className="bg-[#0f0f23] rounded-lg p-4 border border-gray-800">
          <p className="text-sm">
            <span className="text-emerald-400 font-semibold">{submission.testCasesPassed}</span>
            <span className="text-gray-400"> / </span>
            <span className="text-gray-300 font-semibold">{submission.testCasesTotal}</span>
            <span className="text-gray-500"> test cases passed</span>
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      {submission.runtime > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Performance</h3>
          <div className="bg-[#0f0f23] rounded-lg p-4 border border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Runtime</p>
              <p className="text-sm text-white font-mono">{submission.runtime.toFixed(2)}ms</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Memory</p>
              <p className="text-sm text-white font-mono">{submission.memory}MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submission.errorMessage && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Error Message</h3>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30 max-h-32 overflow-y-auto">
            <p className="text-sm text-red-400 font-mono break-words">{submission.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Code */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">Code</h3>
        <div className="bg-[#0f0f23] rounded-lg border border-gray-800 overflow-hidden">
          <pre className="p-4 overflow-x-auto">
            <code className="text-xs text-gray-300 leading-relaxed">
              {submission.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const langMap = {
  cpp: 'c++',
  java: 'java',
  javascript: 'javascript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('testcase');
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Resizable panels state
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [consoleHeight, setConsoleHeight] = useState(320); // pixels
  
  // Timer state
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);
  
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format timer display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-start timer when problem loads
  useEffect(() => {
    if (problem && !isTimerRunning) {
      setIsTimerRunning(true);
    }
  }, [problem]);

  // Auto-save code to localStorage
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (code && problemId) {
        localStorage.setItem(`code_${problemId}_${selectedLanguage}`, code);
      }
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [code, problemId, selectedLanguage]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/getProblemById/${problemId}`);
        const startCodeEntry = response.data.startCode?.find(
          (sc) => sc.language === langMap[selectedLanguage]
        );
        
        // Try to restore saved code first
        const savedCode = localStorage.getItem(`code_${problemId}_${selectedLanguage}`);
        const initialCode = savedCode || startCodeEntry?.initialCode || '';

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const savedCode = localStorage.getItem(`code_${problemId}_${selectedLanguage}`);
      if (savedCode) {
        setCode(savedCode);
      } else {
        const startCodeEntry = problem.startCode?.find(
          (sc) => sc.language === langMap[selectedLanguage]
        );
        const initialCode = startCodeEntry?.initialCode || '';
        setCode(initialCode);
      }
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // Reset code to default
  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset your code? This will discard all changes.')) {
      const startCodeEntry = problem.startCode?.find(
        (sc) => sc.language === langMap[selectedLanguage]
      );
      const initialCode = startCodeEntry?.initialCode || '';
      setCode(initialCode);
      localStorage.removeItem(`code_${problemId}_${selectedLanguage}`);
    }
  };

  // Clear all code
  const handleClearCode = () => {
    if (confirm('Are you sure you want to clear all code?')) {
      setCode('');
      localStorage.removeItem(`code_${problemId}_${selectedLanguage}`);
    }
  };

  // Format code
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Horizontal resize (left panel width)
  const handleHorizontalMouseDown = (e) => {
    isDraggingHorizontal.current = true;
    e.preventDefault();
  };

  const handleHorizontalMouseMove = (e) => {
    if (!isDraggingHorizontal.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  };

  const handleHorizontalMouseUp = () => {
    isDraggingHorizontal.current = false;
  };

  // Vertical resize (console height)
  const handleVerticalMouseDown = (e) => {
    isDraggingVertical.current = true;
    e.preventDefault();
  };

  const handleVerticalMouseMove = (e) => {
    if (!isDraggingVertical.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rightPanel = container.querySelector('.right-panel');
    if (!rightPanel) return;
    
    const panelRect = rightPanel.getBoundingClientRect();
    const newHeight = panelRect.bottom - e.clientY;
    
    // Limit between 100px and 600px
    if (newHeight >= 100 && newHeight <= 600) {
      setConsoleHeight(newHeight);
    }
  };

  const handleVerticalMouseUp = () => {
    isDraggingVertical.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleHorizontalMouseMove);
    document.addEventListener('mouseup', handleHorizontalMouseUp);
    document.addEventListener('mousemove', handleVerticalMouseMove);
    document.addEventListener('mouseup', handleVerticalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleHorizontalMouseMove);
      document.removeEventListener('mouseup', handleHorizontalMouseUp);
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, []);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code: code,
        language: langMap[selectedLanguage] || selectedLanguage
      });

      const tests = Array.isArray(response.data) ? response.data : (response.data?.testCases || []);

      let runtime = 0;
      let memory = 0;

      tests.forEach((t) => {
        const statusId = t.status_id ?? t.status?.id;
        if (statusId == 3) {
          runtime += parseFloat(t.time || 0);
          memory = Math.max(memory, t.memory || 0);
        }
      });

      const success =
        tests.length > 0 &&
        tests.every((t) => (t.status_id ?? t.status?.id) == 3);

      setRunResult({
        success,
        runtime,
        memory,
        testCases: tests,
        raw: response.data,
      });
      setLoading(false);
      setActiveRightTab('testcase');
      setSelectedTestCase(0);

    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error:
          error.response?.data ||
          error.message ||
          'Internal server error',
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: langMap[selectedLanguage] || selectedLanguage,
      });

      const data = response.data || {};
      const accepted = data.status === 'accepted';

      setSubmitResult({
        accepted,
        passedTestCases: data.testCasesPassed ?? 0,
        totalTestCases: data.testCasesTotal ?? 0,
        runtime: data.runtime ?? 0,
        memory: data.memory ?? 0,
        error: accepted ? null : data.errorMessage || 'Wrong answer',
        raw: data,
      });
      setLoading(false);
      setActiveRightTab('result');
      
      // Stop timer on successful submission
      if (accepted) {
        setIsTimerRunning(false);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        passedTestCases: 0,
        totalTestCases: 0,
        runtime: 0,
        memory: 0,
        error:
          error.response?.data ||
          error.message ||
          'Internal server error',
      });
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    const d = (difficulty || '').toLowerCase();
    switch (d) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a1a2e]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen flex bg-[#1a1a2e] text-gray-100 overflow-hidden">
      <style>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #16213e;
        }
        ::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6d28d9;
        }

        /* Monaco Editor Theme */
        .monaco-editor {
          background: #0f0f23 !important;
        }

        /* Test Case Card Hover */
        .test-case-card {
          transition: all 0.2s ease;
        }
        .test-case-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }

        /* Resize Handle Styles */
        .resize-handle-horizontal {
          width: 4px;
          cursor: col-resize;
          background: transparent;
          position: relative;
          transition: background 0.2s;
        }
        
        .resize-handle-horizontal:hover,
        .resize-handle-horizontal:active {
          background: linear-gradient(to right, #7c3aed, #f97316);
        }
        
        .resize-handle-horizontal::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -2px;
          right: -2px;
        }

        .resize-handle-vertical {
          height: 4px;
          cursor: row-resize;
          background: transparent;
          position: relative;
          transition: background 0.2s;
        }
        
        .resize-handle-vertical:hover,
        .resize-handle-vertical:active {
          background: linear-gradient(to bottom, #7c3aed, #f97316);
        }
        
        .resize-handle-vertical::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: -2px;
          bottom: -2px;
        }

        /* Prevent text selection while dragging */
        .dragging {
          user-select: none;
        }
      `}</style>

      {/* Left Panel - Problem Description */}
      <div className="flex flex-col border-r border-gray-800" style={{ width: `${leftWidth}%` }}>
        {/* Left Tabs */}
        <div className="flex items-center bg-[#0f0f23] border-b border-gray-800 px-2">
          {['description', 'editorial', 'solutions', 'submissions'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium transition-all relative ${
                activeLeftTab === tab
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeLeftTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1a1a2e]">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  {/* Title and Badges */}
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {problem.tags}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {problem.description}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Examples</h3>
                    {(problem.visibleTestCases ?? []).map((example, index) => (
                      <div key={index} className="bg-[#0f0f23] border border-gray-800 rounded-lg p-4 space-y-3">
                        <div className="font-semibold text-purple-400">Example {index + 1}</div>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex gap-2">
                            <span className="text-orange-400 font-semibold">Input:</span>
                            <span className="text-gray-300">{example.input}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-orange-400 font-semibold">Output:</span>
                            <span className="text-gray-300">{example.output}</span>
                          </div>
                          {example.explanation && (
                            <div className="pt-2 border-t border-gray-800">
                              <span className="text-gray-400 text-xs">Explanation: </span>
                              <span className="text-gray-300 text-xs">{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Editorial</h2>
                  <div className="bg-[#0f0f23] border border-gray-800 rounded-lg p-6">
                    <Editorial
                      secureUrl={problem.secureUrl}
                      thumbnailUrl={problem.thumbnailUrl}
                      duration={problem.duration}
                    />
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Solutions</h2>
                  <div className="space-y-4">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="bg-[#0f0f23] border border-gray-800 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600/20 to-orange-600/20 px-4 py-3 border-b border-gray-800">
                          <h3 className="font-semibold text-white">
                            {problem?.title} - {solution?.language}
                          </h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-[#1a1a2e] p-4 rounded text-sm overflow-x-auto border border-gray-800">
                            <code className="text-gray-300">{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || (
                      <div className="text-gray-400 text-center py-8">
                        Solutions will be available after you solve the problem.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">My Submissions</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#0f0f23] border border-gray-800 rounded-lg overflow-hidden max-h-96">
                      <SubmissionHistory 
                        problemId={problemId}
                        onSelectSubmission={setSelectedSubmission}
                        selectedSubmissionId={selectedSubmission?._id}
                      />
                    </div>
                    {selectedSubmission && (
                      <div className="bg-[#0f0f23] border border-gray-800 rounded-lg p-4">
                        <SubmissionDetails submission={selectedSubmission} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Horizontal Resize Handle */}
      <div 
        className="resize-handle-horizontal"
        onMouseDown={handleHorizontalMouseDown}
        title="Drag to resize"
      />

      {/* Right Panel - Code Editor */}
      <div className="flex-1 flex flex-col right-panel">
        {/* Top Toolbar */}
        <div className="flex justify-between items-center px-4 py-2 bg-[#0f0f23] border-b border-gray-800">
          {/* Language Selector */}
          <div className="flex gap-2">
            {['javascript', 'java', 'cpp'].map((lang) => (
              <button
                key={lang}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  selectedLanguage === lang
                    ? 'bg-gradient-to-r from-purple-600 to-orange-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => handleLanguageChange(lang)}
              >
                {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
              </button>
            ))}
          </div>
          
          {/* Timer and Controls */}
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-mono text-gray-300">{formatTime(timer)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 text-gray-400 hover:text-white transition-colors"
              >
                {isTimerRunning ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setTimer(0)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1.5 rounded-lg">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                className="text-gray-400 hover:text-white transition-colors px-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="text-xs text-gray-400 w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="text-gray-400 hover:text-white transition-colors px-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* More Options Dropdown */}
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[#0f0f23] border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleResetCode}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 rounded-t-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Code
                </button>
                <button
                  onClick={handleClearCode}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Code
                </button>
                <button
                  onClick={handleFormatCode}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Format Code
                </button>
                <button
                  onClick={toggleFullScreen}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 rounded-b-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 bg-[#0f0f23]" style={{ height: `calc(100% - ${consoleHeight}px - 48px)` }}>
          <Editor
            height="100%"
            language={getLanguageForMonaco(selectedLanguage)}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'line',
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              mouseWheelZoom: true,
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Consolas', monospace",
              fontLigatures: true,
            }}
          />
        </div>

        {/* Vertical Resize Handle */}
        <div 
          className="resize-handle-vertical"
          onMouseDown={handleVerticalMouseDown}
          title="Drag to resize"
        />

        {/* Bottom Console Section */}
        <div className="border-t border-gray-800 bg-[#0f0f23] flex flex-col" style={{ height: `${consoleHeight}px` }}>
          {/* Console Tabs */}
          <div className="flex items-center justify-between bg-[#1a1a2e] border-b border-gray-800 px-2">
            <div className="flex">
              {['testcase', 'result'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium transition-all relative ${
                    activeRightTab === tab
                      ? 'text-purple-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => setActiveRightTab(tab)}
                >
                  {tab === 'testcase' ? 'Testcase' : 'Result'}
                  {activeRightTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Console Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeRightTab === 'testcase' && (
              <div className="space-y-4">
                {/* Test Case Selector */}
                {runResult?.testCases && (
                  <div className="flex gap-2 flex-wrap pb-3 border-b border-gray-800">
                    {runResult.testCases.map((tc, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTestCase(index)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedTestCase === index
                            ? 'bg-purple-600 text-white'
                            : (tc.status_id ?? tc.status?.id) == 3
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        Case {index + 1}
                        {(tc.status_id ?? tc.status?.id) == 3 ? ' ✓' : ' ✗'}
                      </button>
                    ))}
                  </div>
                )}

                {runResult ? (
                  <div className="space-y-4">
                    {/* Overall Status */}
                    <div className={`rounded-lg border p-4 ${
                      runResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {runResult.success ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-400">All test cases passed!</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Ready to submit your solution</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                              <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-rose-400">Test failed</h4>
                              <p className="text-xs text-gray-400 mt-0.5">Check the failed test case below</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-400">Runtime:</span>
                          <span className="text-white font-medium">{runResult.runtime.toFixed(3)}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          <span className="text-gray-400">Memory:</span>
                          <span className="text-white font-medium">{runResult.memory} KB</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Test Case Details */}
                    {runResult.testCases?.[selectedTestCase] && (
                      <div className="test-case-card bg-[#1a1a2e] border border-gray-800 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-white">Test Case {selectedTestCase + 1}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (runResult.testCases[selectedTestCase].status_id ?? runResult.testCases[selectedTestCase].status?.id) == 3
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {(runResult.testCases[selectedTestCase].status_id ?? runResult.testCases[selectedTestCase].status?.id) == 3 ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm font-mono">
                            <div className="bg-[#0f0f23] p-3 rounded border border-gray-800">
                              <div className="text-gray-400 text-xs mb-1">Input</div>
                              <div className="text-gray-300">{runResult.testCases[selectedTestCase].stdin}</div>
                            </div>
                            
                            <div className="bg-[#0f0f23] p-3 rounded border border-gray-800">
                              <div className="text-gray-400 text-xs mb-1">Expected Output</div>
                              <div className="text-gray-300">{runResult.testCases[selectedTestCase].expected_output}</div>
                            </div>
                            
                            <div className={`p-3 rounded border ${
                              (runResult.testCases[selectedTestCase].status_id ?? runResult.testCases[selectedTestCase].status?.id) == 3
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-rose-500/5 border-rose-500/30'
                            }`}>
                              <div className="text-gray-400 text-xs mb-1">Your Output</div>
                              <div className={(runResult.testCases[selectedTestCase].status_id ?? runResult.testCases[selectedTestCase].status?.id) == 3 ? 'text-emerald-400' : 'text-rose-400'}>
                                {runResult.testCases[selectedTestCase].stdout || 'No output'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Run your code to see test results</p>
                    <p className="text-gray-500 text-xs mt-1">Use the "Run" button below</p>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="space-y-4">
                {submitResult ? (
                  <div className={`rounded-lg border p-6 ${
                    submitResult.accepted
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    {submitResult.accepted ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-emerald-400">Accepted</h4>
                            <p className="text-sm text-gray-400">Your solution passed all test cases!</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800">
                          <div className="bg-[#1a1a2e] rounded-lg p-3 border border-gray-800">
                            <div className="text-xs text-gray-400 mb-1">Test Cases</div>
                            <div className="text-lg font-semibold text-white">
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </div>
                          </div>
                          <div className="bg-[#1a1a2e] rounded-lg p-3 border border-gray-800">
                            <div className="text-xs text-gray-400 mb-1">Runtime</div>
                            <div className="text-lg font-semibold text-white">{submitResult.runtime.toFixed(3)}s</div>
                          </div>
                          <div className="bg-[#1a1a2e] rounded-lg p-3 border border-gray-800 col-span-2">
                            <div className="text-xs text-gray-400 mb-1">Memory</div>
                            <div className="text-lg font-semibold text-white">{submitResult.memory} KB</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-rose-400">{submitResult.error}</h4>
                            <p className="text-sm text-gray-400">Your solution didn't pass all test cases</p>
                          </div>
                        </div>
                        <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">Test Cases Passed</div>
                            <div className="text-lg font-semibold text-white">
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </div>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${(submitResult.passedTestCases / submitResult.totalTestCases) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Submit your code to see the verdict</p>
                    <p className="text-gray-500 text-xs mt-1">Make sure your code passes all test cases</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 border-t border-gray-800 bg-[#1a1a2e] flex justify-end items-center">
            <div className="flex gap-2">
              <button
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  loading && activeRightTab === 'testcase'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
                onClick={handleRun}
                disabled={loading}
              >
                {loading && activeRightTab === 'testcase' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run
                  </>
                )}
              </button>
              <button
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  loading && activeRightTab === 'result'
                    ? 'bg-purple-700 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-orange-600 text-white hover:from-purple-700 hover:to-orange-700 shadow-lg shadow-purple-500/20'
                }`}
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading && activeRightTab === 'result' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;