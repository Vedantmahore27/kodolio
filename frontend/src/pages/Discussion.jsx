import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Heart, Trash2, Edit2, Send, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import HeaderPage from './Header';
import AnimatedBackground from './AnimatedBackground';

function Discussion() {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io('http://localhost:3000', {
            withCredentials: true
        });

        // Connect to discussion room
        socketRef.current.emit('join_discussion');

        // Load initial messages
        socketRef.current.on('load_messages', (msgs) => {
            setMessages(msgs);
        });

        // Listen for new messages
        socketRef.current.on('new_message', (msg) => {
            setMessages(prev => [msg, ...prev]);
        });

        // Listen for updated messages
        socketRef.current.on('message_updated', (data) => {
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === data.messageId
                        ? { ...msg, message: data.message, updatedAt: data.updatedAt }
                        : msg
                )
            );
            setEditingId(null);
            setEditingText('');
        });

        // Listen for deleted messages
        socketRef.current.on('message_deleted', (data) => {
            setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
        });

        // Listen for likes
        socketRef.current.on('message_liked', (data) => {
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === data.messageId
                        ? { ...msg, likes: data.likes }
                        : msg
                )
            );
        });

        // Handle errors
        socketRef.current.on('error', (err) => {
            setError(err.message);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Post new message
    const handlePostMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim().length === 0) {
            setError('Message cannot be empty');
            return;
        }

        setLoading(true);
        socketRef.current.emit('post_message', { message: newMessage });
        setNewMessage('');
        setError('');
        setLoading(false);
    };

    // Update message
    const handleUpdateMessage = (messageId) => {
        if (editingText.trim().length === 0) {
            setError('Message cannot be empty');
            return;
        }

        socketRef.current.emit('update_message', { messageId, message: editingText });
    };

    // Delete message
    const handleDeleteMessage = (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            socketRef.current.emit('delete_message', { messageId });
        }
    };

    // Like/Unlike message
    const handleLikeMessage = (messageId) => {
        socketRef.current.emit('like_message', { messageId });
    };

    return (
        <div className="min-h-screen relative bg-gray-900">
            <AnimatedBackground />
            <HeaderPage />

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-2">Community Discussions</h1>
                            <p className="text-gray-400">Connect with the community, share ideas and learn together</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                            🟢 Live
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Message Input Form */}
                <form
                    onSubmit={handlePostMessage}
                    className="mb-8 p-6 rounded-xl backdrop-blur-sm"
                    style={{
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.3)'
                    }}
                >
                    <label className="block text-white font-semibold mb-3">Share your thoughts</label>
                    <textarea
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                        }}
                        placeholder="Type your message here..."
                        className="w-full p-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        rows="4"
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7, #f97316)'
                            }}
                        >
                            <Send size={18} />
                            {loading ? 'Posting...' : 'Post Message'}
                        </button>
                    </div>
                </form>

                {/* Messages Section */}
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No messages yet. Be the first to share!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className="p-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                style={{
                                    backgroundColor: 'rgba(168, 85, 247, 0.05)',
                                    border: '1px solid rgba(168, 85, 247, 0.2)'
                                }}
                            >
                                {/* Message Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {msg.author?.avatar ? (
                                            <img
                                                src={msg.author.avatar}
                                                alt={msg.author?.firstName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                                {msg.author?.firstName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-white">{`${msg.author?.firstName} ${msg.author?.lastName || ''}`}</h3>
                                            <p className="text-xs text-gray-400">
                                                {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {user?._id === msg.author?._id && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(msg._id);
                                                    setEditingText(msg.message);
                                                }}
                                                className="p-2 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Message Content - Editing Mode */}
                                {editingId === msg._id ? (
                                    <div className="mb-3">
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                                            rows="3"
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleUpdateMessage(msg._id)}
                                                className="px-4 py-2 rounded-lg font-bold text-white transition-all duration-300 text-sm"
                                                style={{
                                                    background: 'linear-gradient(135deg, #a855f7, #f97316)'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingText('');
                                                }}
                                                className="px-4 py-2 rounded-lg font-bold text-white transition-all duration-300 text-sm bg-gray-600 hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                )}

                                {/* Like Button */}
                                {editingId !== msg._id && (
                                    <button
                                        onClick={() => handleLikeMessage(msg._id)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
                                    >
                                        <Heart
                                            size={16}
                                            fill={msg.likes?.some(id => id === user?._id || id._id === user?._id) ? 'currentColor' : 'none'}
                                            className={msg.likes?.some(id => id === user?._id || id._id === user?._id) ? 'text-red-500' : ''}
                                        />
                                        <span>{msg.likes?.length || 0} likes</span>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

export default Discussion;
