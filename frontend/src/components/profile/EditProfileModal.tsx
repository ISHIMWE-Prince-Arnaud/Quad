import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Upload, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  processProfileImage,
  processCoverImage,
  revokePreviewUrl,
  formatFileSize
} from '@/lib/imageUtils';
import { UploadService } from '@/services/uploadService';

// Validation schema
const editProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface User {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  isVerified?: boolean;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (data: EditProfileFormData & { 
    profileImage?: File; 
    coverImage?: File;
  }) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave
}: EditProfileModalProps) {
  // Simple toast notification function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // For now, just use console.log - can be enhanced later
    console.log(`${type.toUpperCase()}: ${message}`);
  };
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username,
      bio: user.bio || '',
    }
  });

  // Image upload state
  const [profileImage, setProfileImage] = useState<{
    file: File | null;
    preview: string | null;
    processing: boolean;
  }>({
    file: null,
    preview: null,
    processing: false
  });

  const [coverImage, setCoverImage] = useState<{
    file: File | null;
    preview: string | null;
    processing: boolean;
  }>({
    file: null,
    preview: null,
    processing: false
  });

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Watch bio for character count
  const bioValue = watch('bio') || '';

  // Handle profile image upload
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setProfileImage(prev => ({ ...prev, processing: true }));

    try {
      // Validate file
      const validation = UploadService.validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process image locally first for preview
      const processed = await processProfileImage(file);
      
      // Clean up previous preview
      if (profileImage.preview) {
        revokePreviewUrl(profileImage.preview);
      }

      // Upload to backend
      const uploadResult = await UploadService.uploadProfileImage(processed.file);

      setProfileImage({
        file: processed.file,
        preview: uploadResult.url, // Use uploaded URL for preview
        processing: false
      });

      showToast(`Profile image uploaded successfully - ${formatFileSize(uploadResult.bytes || processed.size)}`);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image');
      setProfileImage(prev => ({ ...prev, processing: false }));
      
      showToast(error instanceof Error ? error.message : 'Failed to process image', 'error');
    }

    // Reset input
    event.target.value = '';
  };

  // Handle cover image upload
  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setCoverImage(prev => ({ ...prev, processing: true }));

    try {
      // Validate file
      const validation = UploadService.validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process image locally first for preview
      const processed = await processCoverImage(file);
      
      // Clean up previous preview
      if (coverImage.preview) {
        revokePreviewUrl(coverImage.preview);
      }

      // Upload to backend
      const uploadResult = await UploadService.uploadCoverImage(processed.file);

      setCoverImage({
        file: processed.file,
        preview: uploadResult.url, // Use uploaded URL for preview
        processing: false
      });

      showToast(`Cover image uploaded successfully - ${formatFileSize(uploadResult.bytes || processed.size)}`);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image');
      setCoverImage(prev => ({ ...prev, processing: false }));
      
      showToast(error instanceof Error ? error.message : 'Failed to process image', 'error');
    }

    // Reset input
    event.target.value = '';
  };

  // Handle form submission
  const onSubmit = async (data: EditProfileFormData) => {
    try {
      await onSave({
        ...data,
        profileImage: profileImage.file || undefined,
        coverImage: coverImage.file || undefined,
      });

      showToast('Profile updated successfully');

      handleClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Something went wrong', 'error');
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Clean up preview URLs
    if (profileImage.preview) {
      revokePreviewUrl(profileImage.preview);
    }
    if (coverImage.preview) {
      revokePreviewUrl(coverImage.preview);
    }

    // Reset state
    setProfileImage({ file: null, preview: null, processing: false });
    setCoverImage({ file: null, preview: null, processing: false });
    setUploadError(null);
    reset();
    onClose();
  };

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.username;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <p className="text-sm text-muted-foreground">Update your profile information and images.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image Section */}
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <div className="relative">
              {/* Cover Image Preview */}
              <div className="relative h-32 sm:h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
                {(coverImage.preview || user.coverImage) && (
                  <img
                    src={coverImage.preview || user.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={coverImage.processing}
                    className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm"
                  >
                    {coverImage.processing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Cover
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Cover Image Input */}
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground mt-2">
                Recommended size: 1200×400px. Max file size: 10MB.
              </p>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={profileImage.preview || user.profileImage} 
                    alt="Profile preview" 
                  />
                  <AvatarFallback className="text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Image Upload Button */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={profileImage.processing}
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg"
                >
                  {profileImage.processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={profileImage.processing}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {profileImage.processing ? 'Processing...' : 'Upload New Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Square image recommended. Max file size: 10MB.
                </p>
              </div>

              {/* Profile Image Input */}
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username')}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio</Label>
              <span className="text-xs text-muted-foreground">
                {bioValue.length}/500
              </span>
            </div>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none"
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || profileImage.processing || coverImage.processing}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
