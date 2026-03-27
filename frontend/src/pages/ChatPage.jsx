import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
import { useAuth }                      from '../context/AuthContext';
import { useChat }                      from '../hooks/useChat';
import ChatMessage                      from '../components/ChatMessage';
import api                              from '../services/api';

export default function ChatPage() {
  const { sessionId }   = useParams();
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const { messages, streaming, loadMessages, sendMessage } = useChat(sessionId);
  const [input,    setInput]   = useState('');
  const [session,  setSession] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat').then(r => {
      const s = r.data.find(s => s._id === sessionId);
      setSession(s);
    });
    loadMessages(api);
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const q = input.trim();
    setInput('');
    await sendMessage(q, localStorage.getItem('token'));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-sm font-semibold text-violet-400">
            🧠 {session?.document?.originalName || 'Chat'}
          </h1>
          <p className="text-xs text-gray-500">Ask anything about this document</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm">Ask a question about your document</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-800 px-4 py-4 flex gap-3 shrink-0"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={streaming}
          placeholder={streaming ? 'AI is thinking...' : 'Ask a question...'}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {streaming ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}