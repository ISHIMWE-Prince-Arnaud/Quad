import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { usePostStore } from '../store/postStore';
import { toast } from 'react-toastify';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadPost } = usePostStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !caption.trim()) {
      toast.error('Please provide both an image and caption');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);

      await uploadPost(formData);
      
      toast.success('Post uploaded successfully! 🎉');
      
      // Reset form
      setCaption('');
      setFile(null);
      setPreview(null);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image/Video
            </label>
            {preview ? (
              <div className="relative">
                {file?.type.startsWith('video/') ? (
                  <video src={preview} controls className="w-full rounded-lg" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full rounded-lg" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={48} className="text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF, MP4 (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something funny... Add #hashtags!"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {caption.length}/500 characters
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tips:</strong> Use hashtags like #fail #professor #relatable to reach more students!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !file || !caption.trim()}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon size={20} />
                <span>Post to Quad</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
