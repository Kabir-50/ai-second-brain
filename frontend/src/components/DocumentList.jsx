import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  ready:      'bg-green-500/10  text-green-400',
  processing: 'bg-yellow-500/10 text-yellow-400',
  failed:     'bg-red-500/10    text-red-400',
  uploading:  'bg-blue-500/10   text-blue-400',
};

const FILE_ICONS = { pdf: '📕', txt: '📝', docx: '📘' };

function formatBytes(bytes) {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, onDelete, onChatStart }) {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      onDelete?.(id);
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!documents.length)
    return <p className="text-gray-500 text-sm text-center py-6">No documents yet.</p>;

  return (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li key={doc._id}
          className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">{FILE_ICONS[doc.fileType] || '📄'}</span>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{doc.originalName}</p>
              <p className="text-gray-500 text-xs">{formatBytes(doc.fileSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[doc.status]}`}>
              {doc.status}
            </span>
            {doc.status === 'ready' && (
              <button
                onClick={() => onChatStart?.(doc)}
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                Chat
              </button>
            )}
            <button
              onClick={() => handleDelete(doc._id)}
              className="text-gray-500 hover:text-red-400 transition-colors text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}