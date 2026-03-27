import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DocumentUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success(`"${file.name}" uploaded!`);
      onUploadSuccess?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf':  ['.pdf'],
      'text/plain':        ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700 hover:border-gray-600'}
        ${uploading    ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-3">📄</div>
      {uploading ? (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Uploading... {progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : isDragActive ? (
        <p className="text-violet-400 text-sm">Drop it here...</p>
      ) : (
        <>
          <p className="text-gray-300 text-sm font-medium">
            Drag & drop a file here, or click to select
          </p>
          <p className="text-gray-500 text-xs mt-1">PDF, TXT, DOCX — max 10MB</p>
        </>
      )}
    </div>
  );
}