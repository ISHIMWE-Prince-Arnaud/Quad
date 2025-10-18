import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { confessionsAPI } from '../../services/api';

interface CreateConfessionProps {
  onCreated: () => void;
}

const CreateConfession: React.FC<CreateConfessionProps> = ({ onCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get or create anonymous ID from localStorage
  const getAnonymousId = () => {
    let anonId = localStorage.getItem('anonymousAuthorId');
    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousAuthorId', anonId);
    }
    return anonId;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter your confession');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('anonymousAuthorId', getAnonymousId());
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await confessionsAPI.createConfession(formData);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create confession');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Anonymous Notice */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <p className="text-sm text-purple-900 dark:text-purple-200">
          🎭 Your confession will be posted anonymously. No one will know it's you!
        </p>
      </div>

      {/* Content */}
      <Textarea
        label="Your Confession"
        placeholder="Share your thoughts anonymously..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        maxLength={1000}
        required
      />

      {/* Media Upload (Optional) */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="confession-media-upload"
        />
        
        {!mediaPreview ? (
          <label
            htmlFor="confession-media-upload"
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
          >
            <ImageIcon size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Add media (optional)</span>
          </label>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 z-10 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            >
              <X size={16} />
            </button>
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} controls className="w-full h-48 object-cover rounded-lg" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Submit */}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Sharing...' : 'Share Anonymously'}
      </Button>
    </form>
  );
};

export default CreateConfession;
