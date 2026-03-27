import { useState, useRef } from 'react';

export const useChat = (sessionId) => {
  const [messages,  setMessages]  = useState([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);

  const loadMessages = async (api) => {
    const { data } = await api.get(`/chat/${sessionId}/messages`);
    setMessages(data);
  };

  const sendMessage = async (question, token) => {
    setMessages(prev => [...prev, { role: 'user', content: question, _id: Date.now() }]);
    setStreaming(true);

    const assistantMsg = { role: 'assistant', content: '', _id: Date.now() + 1, streaming: true };
    setMessages(prev => [...prev, assistantMsg]);

    const res = await fetch(`/api/chat/${sessionId}/message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ question }),
    });

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    abortRef.current = reader;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data:'));
      for (const line of lines) {
        const parsed = JSON.parse(line.slice(5).trim());
        if (parsed.type === 'chunk') {
          setMessages(prev => prev.map(m =>
            m.streaming ? { ...m, content: m.content + parsed.text } : m
          ));
        }
        if (parsed.type === 'done') {
          setMessages(prev => prev.map(m =>
            m.streaming ? { ...m, streaming: false, sources: parsed.sources } : m
          ));
        }
      }
    }
    setStreaming(false);
  };

  return { messages, streaming, loadMessages, sendMessage };
};