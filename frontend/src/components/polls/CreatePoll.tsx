import React, { useState, useRef } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { pollsAPI } from '../../services/api';

interface CreatePollProps {
  onCreated: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isWouldYouRather, setIsWouldYouRather] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
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
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('question', question.trim());
      formData.append('options', JSON.stringify(validOptions));
      formData.append('isWouldYouRather', String(isWouldYouRather));
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await pollsAPI.createPoll(formData);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Question */}
      <Input
        label="Question"
        placeholder="What's your question?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={300}
        required
      />

      {/* Poll Type */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="would-you-rather"
          checked={isWouldYouRather}
          onChange={(e) => setIsWouldYouRather(e.target.checked)}
          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
        />
        <label htmlFor="would-you-rather" className="text-sm text-gray-700 dark:text-gray-300">
          This is a "Would You Rather" poll
        </label>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              maxLength={100}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
        
        {options.length < 10 && (
          <Button type="button" variant="secondary" onClick={handleAddOption} size="sm">
            <Plus size={16} className="inline mr-1" /> Add Option
          </Button>
        )}
      </div>

      {/* Media Upload (Optional) */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="poll-media-upload"
        />
        
        {!mediaPreview ? (
          <label
            htmlFor="poll-media-upload"
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
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
              <video src={mediaPreview} controls className="w-full h-32 object-cover rounded-lg" />
            ) : (
              <img src={mediaPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Submit */}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Creating...' : 'Create Poll'}
      </Button>
    </form>
  );
};

export default CreatePoll;
