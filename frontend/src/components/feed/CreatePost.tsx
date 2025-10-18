import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { postsAPI } from '../../services/api';

interface CreatePostProps {
  onCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onCreated }) => {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setError('');
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
    
    if (!mediaFile) {
      setError('Please select an image or video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append('caption', caption);

      await postsAPI.createPost(formData);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const isVideo = mediaFile?.type.startsWith('video/');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Media Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        
        {!mediaPreview ? (
          <label
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
          >
            <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="flex gap-2">
                <ImageIcon size={32} />
                <Video size={32} />
              </div>
              <p className="text-sm font-medium">Click to upload image or video</p>
              <p className="text-xs">PNG, JPG, GIF, MP4, MOV</p>
            </div>
          </label>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            >
              <X size={20} />
            </button>
            {isVideo ? (
              <video src={mediaPreview} controls className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      <Textarea
        label="Caption (optional)"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        maxLength={500}
      />

      {/* Error */}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Submit */}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
};

export default CreatePost;
