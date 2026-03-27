import { useState, useEffect, useRef } from 'react';
import { useNavigate }                 from 'react-router-dom';
import { useAuth }                     from '../context/AuthContext';
import DocumentUpload                  from '../components/DocumentUpload';
import DocumentList                    from '../components/DocumentList';
import api                             from '../services/api';
import toast                           from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [documents, setDocs] = useState([]);
  const pollRef              = useRef(null);

  const fetchDocs = async () => {
    const { data } = await api.get('/documents');
    setDocs(data);
    return data;
  };

  // Poll every 3 seconds if any doc is still processing
  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'processing');

    if (hasProcessing) {
      pollRef.current = setInterval(async () => {
        const data = await fetchDocs();
        const stillProcessing = data.some(d => d.status === 'processing');
        if (!stillProcessing) {
          clearInterval(pollRef.current);
          toast.success('Document ready! You can now chat.');
        }
      }, 3000);
    }

    return () => clearInterval(pollRef.current);
  }, [documents.map(d => d.status).join(',')]);

  const handleUploadSuccess = (newDoc) => {
    setDocs(prev => [newDoc, ...prev]);
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d._id !== id));
  };

  const handleChatStart = async (doc) => {
    try {
      const { data } = await api.post('/chat', { documentId: doc._id });
      navigate(`/chat/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-violet-400">🧠 AI Second Brain</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={logout}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-1">Upload a Document</h2>
          <p className="text-gray-400 text-sm mb-4">Upload PDF, TXT, or DOCX — then chat with it using AI.</p>
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            onChatStart={handleChatStart}
          />
        </div>
      </main>
    </div>
  );
}