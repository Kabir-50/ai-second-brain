import { useState } from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="text-lg shrink-0">
            {isUser ? '👤' : '🧠'}
          </div>
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? 'bg-violet-600 text-white rounded-tr-none'
              : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
            }`}
          >
            {message.content}
            {message.streaming && (
              <span className="inline-block w-1.5 h-4 bg-violet-400 ml-1 animate-pulse rounded-sm" />
            )}
          </div>
        </div>

        {/* Sources */}
        {message.sources?.length > 0 && (
          <div className="mt-2 ml-8">
            <button
              onClick={() => setShowSources(s => !s)}
              className="text-xs text-gray-500 hover:text-violet-400 transition-colors"
            >
              {showSources ? '▼' : '▶'} {message.sources.length} source chunk{message.sources.length > 1 ? 's' : ''}
            </button>
            {showSources && (
              <div className="mt-1 space-y-1">
                {message.sources.map((s, i) => (
                  <div key={i} className="text-xs bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-400">
                    {s.chunkText?.slice(0, 200)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}