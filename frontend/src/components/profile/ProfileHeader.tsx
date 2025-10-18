import React, { useRef, useState } from 'react';
import { User, Upload } from 'lucide-react';
import { User as UserType } from '../../types';
import { usersAPI } from '../../services/api';
import { formatFullDateTime } from '../../utils/formatTimeAgo';
import Button from '../common/Button';

interface ProfileHeaderProps {
  user: UserType;
  isOwnProfile: boolean;
  onProfileUpdate?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      await usersAPI.updateProfilePicture(formData);
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      // Reload page to update profile picture everywhere
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      alert('Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-6">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-primary-600 dark:text-primary-400" />
            )}
          </div>

          {/* Upload Button */}
          {isOwnProfile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-picture-upload"
              />
              <label
                htmlFor="profile-picture-upload"
                className={`absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors ${uploading ? 'opacity-50' : ''}`}
              >
                <Upload size={16} />
              </label>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Joined {formatFullDateTime(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
