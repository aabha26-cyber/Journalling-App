'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Moon, Sun, Trash2, Edit2, X, Save, MessageCircle, Send } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: string;
  tags: string[];
  wordCount: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-400' },
  { emoji: '😢', label: 'Sad', color: 'bg-blue-400' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-400' },
  { emoji: '😌', label: 'Calm', color: 'bg-green-400' },
  { emoji: '🤔', label: 'Thoughtful', color: 'bg-purple-400' },
  { emoji: '😴', label: 'Tired', color: 'bg-gray-400' },
  { emoji: '🎉', label: 'Excited', color: 'bg-pink-400' },
  { emoji: '💭', label: 'Reflective', color: 'bg-indigo-400' },
];

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', mood: '😊', tags: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('journalEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      setIsDarkMode(true);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSave = () => {
    if (!formData.title.trim() && !formData.content.trim()) return;

    const wordCount = calculateWordCount(formData.content);
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

    if (editingEntry) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, ...formData, tags: tagsArray, wordCount, date: new Date().toISOString() }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: formData.title || 'Untitled',
        content: formData.content,
        date: new Date().toISOString(),
        mood: formData.mood,
        tags: tagsArray,
        wordCount,
      };
      setEntries([newEntry, ...entries]);
    }

    // Reset form
    setFormData({ title: '', content: '', mood: '😊', tags: '' });
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    setShowDeleteConfirm(null);
  };

  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query)) ||
      new Date(entry.date).toLocaleDateString().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };

  const toggleChat = () => {
    setIsChatOpen((open) => {
      const next = !open;
      if (next && chatMessages.length === 0) {
        setChatMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: "Hi, I'm your journaling companion. You can share how you're feeling or ask for a gentle reflection.",
          },
        ]);
      }
      return next;
    });
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
    };

    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setChatError(data.error || 'Something went wrong talking to the AI.');
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '',
      };

      setChatMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setChatError('Unable to reach the AI. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'gradient-bg-dark' : 'gradient-bg'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Journal</h1>
            <p className="text-white/80">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="glass p-3 rounded-full text-white hover:scale-110 transition-transform"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <Search className="text-white/70" size={20} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
            />
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📔</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? 'No entries found' : 'Start your journaling journey'}
            </h2>
            <p className="text-white/70 mb-6">
              {searchQuery 
                ? 'Try a different search term'
                : 'Click the + button to write your first entry'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => {
              const moodData = MOODS.find(m => m.emoji === entry.mood) || MOODS[0];
              return (
                <div
                  key={entry.id}
                  className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer group"
                  onClick={() => handleEdit(entry)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{entry.mood}</span>
                      <span className={`${moodData.color} w-2 h-2 rounded-full`}></span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(entry);
                        }}
                        className="p-2 glass rounded-lg text-white hover:bg-white/20"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(entry.id);
                        }}
                        className="p-2 glass rounded-lg text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{entry.title}</h3>
                  <p className="text-white/70 text-sm mb-3 line-clamp-3">{getPreview(entry.content)}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{formatDate(entry.date)}</span>
                    <span>{entry.wordCount} words</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={() => {
            setEditingEntry(null);
            setFormData({ title: '', content: '', mood: '😊', tags: '' });
            setIsModalOpen(true);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:scale-110 transition-transform z-50"
        >
          <Plus size={28} />
        </button>

        {/* AI Chat Button */}
        <button
          onClick={toggleChat}
          className="fixed bottom-8 left-8 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <MessageCircle size={24} />
        </button>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <div className="fixed bottom-28 right-8 w-full max-w-md glass rounded-2xl p-4 z-50 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">AI Journaling Companion</h3>
                <p className="text-xs text-white/60">Ask questions, reflect on entries, or talk about your day.</p>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-500 text-white rounded-br-sm'
                        : 'bg-white/15 text-white rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="text-xs text-white/60">Thinking...</div>
              )}
              {chatError && (
                <div className="text-xs text-red-300">{chatError}</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white/40"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 rounded-full bg-white text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Modal for Writing/Editing */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'glass-dark' : 'glass'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingEntry ? 'Edit Entry' : 'New Entry'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                    setFormData({ title: '', content: '', mood: '😊', tags: '' });
                  }}
                  className="text-white/70 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                />

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.emoji}
                        onClick={() => setFormData({ ...formData, mood: mood.emoji })}
                        className={`p-3 rounded-lg transition-all ${
                          formData.mood === mood.emoji
                            ? 'bg-white/30 scale-110'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Content</label>
                  <textarea
                    placeholder="Write your thoughts..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/40 min-h-[200px] resize-none"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    {calculateWordCount(formData.content)} words
                  </p>
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., work, personal, reflection"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-white text-purple-600 font-semibold py-3 rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Entry
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingEntry(null);
                      setFormData({ title: '', content: '', mood: '😊', tags: '' });
                    }}
                    className="px-6 py-3 glass rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Delete Entry?</h3>
              <p className="text-white/70 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 glass py-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
