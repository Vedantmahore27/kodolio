



import { Code2, Brain, Trophy, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';
import HeaderPage from "../pages/Header"
import logo from '../assets/logo.png';
import './authBackground.css';
import AdminUpload from '../component/AdminUpload';


function Home() {
  // Typing animation component - words alternate between white, purple, and orange
  // Content stays in fixed position while typing
  const TypingAnimation = ({ text, speed = 100 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const whiteColor = '#ffffff';
    const purpleColor = '#a855f7';
    const orangeColor = '#f97316';
    const colors = [whiteColor, purpleColor, orangeColor]; // Color cycle: white, purple, orange

    useEffect(() => {
      setDisplayedText('');
      setCurrentIndex(0);
    }, [text]);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      }
    }, [currentIndex, text, speed]);

    // Determine color for each character based on which word it belongs to
    const getWordIndex = (charIndex) => {
      // Get text up to current character
      const textUpToChar = text.substring(0, charIndex + 1);
      // Split by spaces and count words (remove empty strings)
      const words = textUpToChar.trimEnd().split(/\s+/);
      return words.length - 1; // Word index (0-based)
    };
    
    return (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {/* Invisible full text to reserve space and prevent layout shift */}
        <span style={{ 
          visibility: 'hidden', 
          display: 'inline-block',
          whiteSpace: 'nowrap',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        }}>
          {text}
        </span>
        {/* Visible typing text - positioned absolutely over the hidden text */}
        <span style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          whiteSpace: 'nowrap',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        }}>
          {displayedText.split('').map((char, idx) => {
            // Get which word this character belongs to
            const wordIndex = getWordIndex(idx);
            // Cycle through colors: white, purple, orange, white, purple, orange...
            const color = colors[wordIndex % colors.length];
            
            return (
              <span key={idx} style={{ color: char === ' ' ? 'inherit' : color }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
          {currentIndex < text.length && <span className="animate-pulse">|</span>}
        </span>
      </span>
    );
  };

  // Text animation component
  const AnimatedText = ({ text, colors }) => {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <style>{`
          @keyframes slideInWord {
            0% {
              opacity: 0;
              transform: translateX(-50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animated-word {
            animation: slideInWord 0.8s ease-out forwards;
            display: inline-block;
            margin-right: 10px;
          }
          .word-0 { animation-delay: 0s; }
          .word-1 { animation-delay: 0.2s; }
          .word-2 { animation-delay: 0.4s; }
          .word-3 { animation-delay: 0.6s; }
          .word-4 { animation-delay: 0.8s; }
        `}</style>
        <div>
          {text.split(' ').map((word, idx) => (
            <span key={idx} className={`animated-word word-${idx}`} style={{color: colors[idx % colors.length]}}>
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* ==================== HEADER / NAVIGATION ==================== */}
      <HeaderPage></HeaderPage>
  
      <div className="relative z-10">
      {/* ==================== HERO SECTION ==================== */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Gradient Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight w-full">
                <TypingAnimation 
                  text="Level up your DSA Skills" 
                  speed={80}
                />
              </h1>
              <h2 className="text-4xl lg:text-5xl font-bold w-full mt-2">
                <TypingAnimation 
                  text="Crack Interviews" 
                  speed={100}
                />
              </h2>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              Practice curated DSA problems, track your progress, compete with friends, and prepare for your dream job.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <NavLink
                to="/problems"
                className="px-8 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #f97316)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                }}
              >
                🚀 Start Solving
              </NavLink>
              <button
                className="px-8 py-4 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 border-2"
                style={{
                  borderColor: '#a855f7',
                  color: '#a855f7'
                }}
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">500+</div>
                <div className="text-gray-400 text-sm">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">50K+</div>
                <div className="text-gray-400 text-sm">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">100+</div>
                <div className="text-gray-400 text-sm">Contests</div>
              </div>
            </div>
          </div>

          {/* Right Side - Reserved for Custom Animation */}
          <div className="h-96 flex items-center justify-center">
            {/* Your animation will go here */}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-20 px-4" style={{backgroundColor: 'transparent'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive tools to master DSA and land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* DSA Practice Card */}
            <div
              className="p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                borderColor: 'rgba(168, 85, 247, 0.4)',
                borderWidth: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)';
              }}
            >
              <Brain className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">DSA Practice</h3>
              <p className="text-gray-400">Solve 500+ curated DSA problems with detailed solutions</p>
            </div>

            {/* Contests Card */}
            <div
              className="p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                borderColor: 'rgba(249, 115, 22, 0.4)',
                borderWidth: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.08)';
              }}
            >
              <Trophy className="w-12 h-12 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Contests</h3>
              <p className="text-gray-400">Compete with friends in weekly coding contests</p>
            </div>

            {/* Discussions Card */}
            <div
              className="p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                borderColor: 'rgba(168, 85, 247, 0.4)',
                borderWidth: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.08)';
              }}
            >
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Discussions</h3>
              <p className="text-gray-400">Learn from community insights and expert solutions</p>
            </div>

            {/* Progress Tracker Card */}
            <div
              className="p-8 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                borderColor: 'rgba(249, 115, 22, 0.4)',
                borderWidth: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.08)';
              }}
            >
              <TrendingUp className="w-12 h-12 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Progress Tracker</h3>
              <p className="text-gray-400">Track your skills and see improvements over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HIRING PARTNERS SECTION ==================== */}
      <section className="py-20 px-4" style={{backgroundColor: 'transparent'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Interview Questions
            </h2>
            <p className="text-gray-400 text-lg">
              Master interview problems from top tech companies
            </p>
          </div>

          <style>{`
            @keyframes slideInLeft {
              0% {
                opacity: 0;
                transform: translateX(-50px);
              }
              100% {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .company-card {
              animation: slideInLeft 0.6s ease-out forwards;
            }
            .company-card-0 { animation-delay: 0s; }
            .company-card-1 { animation-delay: 0.1s; }
            .company-card-2 { animation-delay: 0.2s; }
            .company-card-3 { animation-delay: 0.3s; }
            .company-card-4 { animation-delay: 0.4s; }
            .company-card-5 { animation-delay: 0.5s; }
            .company-card-6 { animation-delay: 0.6s; }
            .company-card-7 { animation-delay: 0.7s; }
            .company-card-8 { animation-delay: 0.8s; }
            .company-card-9 { animation-delay: 0.9s; }
            .company-card-10 { animation-delay: 1s; }
            .company-card-11 { animation-delay: 1.1s; }
          `}</style>

          {/* Horizontal scrolling container with cursor movement */}
          <div 
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              cursor: 'grab'
            }}
            onMouseMove={(e) => {
              const container = e.currentTarget;
              if (e.buttons === 1) {
                container.style.cursor = 'grabbing';
                container.scrollLeft -= e.movementX;
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.cursor = 'grab';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = 'grab';
            }}
          >
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {[
              {
                name: 'Google',
                symbol: 'G',
                color: '#4285F4',
                bgColor: '#1a2847',
                totalProblems: 234,
                easy: 67,
                medium: 123,
                hard: 44,
                successRate: 42.3,
                submissions: 1234567,
                avgPercent: 42.30
              },
              {
                name: 'Amazon',
                symbol: 'A',
                color: '#FF9900',
                bgColor: '#2a2416',
                totalProblems: 198,
                easy: 78,
                medium: 89,
                hard: 31,
                successRate: 45.7,
                submissions: 987654,
                avgPercent: 45.70
              },
              {
                name: 'Microsoft',
                symbol: 'M',
                color: '#00A4EF',
                bgColor: '#162842',
                totalProblems: 167,
                easy: 52,
                medium: 78,
                hard: 37,
                successRate: 41.8,
                submissions: 645234,
                avgPercent: 41.80
              },

              {
                name: 'Oracle',
                symbol: 'O',
                color: '#F80000',
                bgColor: '#402020 ',
                totalProblems: 134,
                easy: 35,
                medium: 64,
                hard: 35,
                successRate: 38.9,
                submissions: 345678,
                avgPercent: 38.90
              },
                {
                name: 'Apple',
                symbol: '🍎',
                color: '#555555',
                bgColor: '##facc15',
                totalProblems: 142,
                easy: 38,
                medium: 68,
                hard: 36,
                successRate: 40.2,
                submissions: 456123,
                avgPercent: 40.20
              },
              {
                name: 'IBM',
                symbol: 'I',
                color: '#3a1b4f',
                bgColor: '#151d38',
                totalProblems: 98,
                easy: 28,
                medium: 49,
                hard: 21,
                successRate: 36.3,
                submissions: 123456,
                avgPercent: 36.30
              },
              {
                name: 'Meta',
                symbol: 'f',
                color: '#1877F2',
                bgColor: '#141d3a',
                totalProblems: 176,
                easy: 45,
                medium: 89,
                hard: 42,
                successRate: 39.5,
                submissions: 567890,
                avgPercent: 39.50
              },
              {
                name: 'Airbnb',
                symbol: 'A',
                color: '#FF5A5F',
                bgColor: '#2a1820',
                totalProblems: 93,
                easy: 26,
                medium: 47,
                hard: 20,
                successRate: 40.1,
                submissions: 209876,
                avgPercent: 40.10
              },
            ].map((company, index) => {
              const cardRef = useRef(null);
              const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

              const handleMouseMove = (e) => {
                if (!cardRef.current) return;
                const card = cardRef.current;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
                const rotateY = ((x - centerX) / centerX) * 10; // Max 10 degrees
                const scale = 1.05;
                
                setTransform({ rotateX, rotateY, scale });
              };

              const handleMouseLeave = () => {
                setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
              };

              return (
              <div 
                key={company.name}
                ref={cardRef}
                className={`
                  company-card company-card-${index}
                  rounded-2xl overflow-hidden
                  group cursor-pointer
                  flex-shrink-0
                `}
                style={{
                  width: '380px',
                  backgroundColor: `${company.bgColor}80`,
                  border: `1px solid ${company.color}60`,
                  backdropFilter: 'blur(10px)',
                  transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale}) translateZ(0)`,
                  transition: 'transform 0.1s ease-out, box-shadow 0.3s ease-out',
                  boxShadow: transform.scale > 1 
                    ? `0 20px 40px rgba(168, 85, 247, 0.4), 0 0 ${20 * transform.scale}px ${company.color}40`
                    : `0 4px 6px rgba(0, 0, 0, 0.1)`,
                  transformStyle: 'preserve-3d',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >

                {/* Header with company name in rounded rectangle */}
                <div className="relative h-24 overflow-hidden flex items-center justify-center backdrop-blur-sm" style={{background: `linear-gradient(135deg, ${company.color}20, ${company.color}10)`}}>
                  <div className="absolute inset-0 opacity-30" style={{background: `linear-gradient(135deg, ${company.color}40, ${company.color}30)`}}></div>
                  
                  {/* Company Name Badge - Rounded Rectangle */}
                  <div 
                    className="px-5 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm z-10"
                    style={{
                      backgroundColor: `${company.color}20`,
                      border: `2px solid ${company.color}20`,
                      boxShadow: `0 4px 12px ${company.color}30`
                    }}
                  >
                    
                    <span className="text-white font-bold text-lg">{company.name}</span>
                  </div>

                  {/* Success Rate Badge */}
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 z-10">
                    <span className="text-xs text-gray-300">📈</span>
                    <span className="text-white font-semibold text-sm">{company.avgPercent}% avg</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3">Master {company.name}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">
                    Master {company.name} interview questions with our curated problem collection and real interview experiences.
                  </p>

                  {/* Total Problems */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Total Problems</span>
                      <span style={{color: company.color}} className="text-2xl font-bold">{company.totalProblems}</span>
                    </div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-400">Easy</span>
                      </div>
                      <span className="text-white font-semibold">{company.easy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-400">Medium</span>
                      </div>
                      <span className="text-white font-semibold">{company.medium}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-gray-400">Hard</span>
                      </div>
                      <span className="text-white font-semibold">{company.hard}</span>
                    </div>
                  </div>

                  {/* Success Rate Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Success Rate</span>
                      <span style={{color: company.color}} className="text-sm font-semibold">{company.successRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${company.successRate}%`,
                          background: `linear-gradient(90deg, ${company.color}, ${company.color}dd)`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Total Submissions */}
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total Submissions</span>
                      <span className="text-white font-semibold">{(company.submissions / 1000).toFixed(0)}K+</span>
                    </div>
                  </div>

                  {/* Explore Button */}
                  <button
                    className="w-full mt-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                    style={{
                      background: `linear-gradient(135deg, ${company.color}, ${company.color}cc)`,
                    }}
                  >
                    Explore Problems <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== UPSKILLING PATHS SECTION ==================== */}
      <section className="py-20 px-4" style={{backgroundColor: 'transparent'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-gray-400 text-lg">
              Master different domains with curated content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* DSA Path */}
            <div
              className="relative group overflow-hidden rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgba(168, 85, 247, 0.5)',
                borderWidth: '2px'
              }}
            >
              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{background: 'linear-gradient(135deg, #a855f7, #f97316)'}}
              ></div>

              <div className="relative p-8 space-y-6">
                <div className="text-5xl">🧠</div>
                <h3 className="text-2xl font-bold text-white">Data Structures & Algorithms</h3>
                <p className="text-gray-400">
                  Master arrays, linked lists, trees, graphs, dynamic programming and more.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>50+ curated problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>Video explanations</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>Interview questions</span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #a855f7)',
                  }}
                >
                  Start Learning
                </button>
              </div>
            </div>

            {/* Frontend Path */}
            <div
              className="relative group overflow-hidden rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderColor: 'rgba(249, 115, 22, 0.5)',
                borderWidth: '2px'
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{background: 'linear-gradient(135deg, #a855f7, #f97316)'}}
              ></div>

              <div className="relative p-8 space-y-6">
                <div className="text-5xl">🎨</div>
                <h3 className="text-2xl font-bold text-white">Frontend Development</h3>
                <p className="text-gray-400">
                  Build beautiful, responsive web applications with modern frameworks.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-orange-400">
                    <ArrowRight size={16} />
                    <span>React & Vue basics</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <ArrowRight size={16} />
                    <span>CSS & Tailwind</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400">
                    <ArrowRight size={16} />
                    <span>Real-world projects</span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #f97316)',
                  }}
                >
                  Start Learning
                </button>
              </div>
            </div>

            {/* Backend Path */}
            <div
              className="relative group overflow-hidden rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderColor: 'rgba(168, 85, 247, 0.5)',
                borderWidth: '2px'
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{background: 'linear-gradient(135deg, #a855f7, #f97316)'}}
              ></div>

              <div className="relative p-8 space-y-6">
                <div className="text-5xl">⚙️</div>
                <h3 className="text-2xl font-bold text-white">Backend Development</h3>
                <p className="text-gray-400">
                  Master server-side development with databases and APIs.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>Node.js & Express</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>Database design</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <ArrowRight size={16} />
                    <span>REST & GraphQL APIs</span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #a855f7)',
                  }}
                >
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Ready to Master DSA?
          </h2>
          <p className="text-gray-400 text-xl">
            Join thousands of developers preparing for their dream jobs
          </p>
          <NavLink
            to="/problems"
            className="inline-block px-10 py-5 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #f97316)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
            }}
          >
            🚀 Start Your Journey Now
          </NavLink>
        </div>
      </section>
      </div>
    </div>
  );
}



export default Home;
