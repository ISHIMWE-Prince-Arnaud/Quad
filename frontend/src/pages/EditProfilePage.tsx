import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ProfileService } from "@/services/profileService";
import { UploadService } from "@/services/uploadService";
import { Card, CardContent } from "@/components/ui/card";
import { CoverImageSection } from "@/components/profile/edit-profile/CoverImageSection";
import { ProfileImageSection } from "@/components/profile/edit-profile/ProfileImageSection";
import { EditProfileFields } from "@/components/profile/edit-profile/EditProfileFields";
import { EditProfileActions } from "@/components/profile/edit-profile/EditProfileActions";
import { UploadErrorAlert } from "@/components/profile/edit-profile/UploadErrorAlert";
import { processProfileImage, processCoverImage } from "@/lib/imageUtils";
import { showErrorToast, showSuccessToast } from "@/lib/errorHandling";

const editProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
  bio: z.string().max(500).optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const [profileImage, setProfileImage] = useState({
    preview: user?.profileImage || null,
    processing: false,
  });

  const [coverImage, setCoverImage] = useState({
    preview: user?.coverImage || null,
    processing: false,
  });

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setProfileImage((prev) => ({ ...prev, processing: true }));
    const toastId = toast.loading("Uploading profile image...");
    try {
      const processed = await processProfileImage(file);
      const res = await UploadService.uploadProfileImage(processed.file);
      setProfileImage({ preview: res.url, processing: false });
      toast.dismiss(toastId);
      showSuccessToast("Profile image uploaded");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      setProfileImage((prev) => ({ ...prev, processing: false }));
      toast.dismiss(toastId);
      showErrorToast(err);
    }
  };

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setCoverImage((prev) => ({ ...prev, processing: true }));
    const toastId = toast.loading("Uploading cover image...");
    try {
      const processed = await processCoverImage(file);
      const res = await UploadService.uploadCoverImage(processed.file);
      setCoverImage({ preview: res.url, processing: false });
      toast.dismiss(toastId);
      showSuccessToast("Cover image uploaded");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      setCoverImage((prev) => ({ ...prev, processing: false }));
      toast.dismiss(toastId);
      showErrorToast(err);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user) return;
    const toastId = toast.loading("Saving profile...");
    try {
      const updated = await ProfileService.updateProfile(user.username, {
        ...data,
        profileImage: profileImage.preview,
        coverImage: coverImage.preview,
      });
      setUser({ ...user, ...updated });
      toast.dismiss(toastId);
      showSuccessToast("Profile updated");
      navigate(`/profile/${updated.username}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      setUploadError(message);
      toast.dismiss(toastId);
      showErrorToast(err);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <header className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#0f121a] border border-white/5 text-[#64748b] hover:text-white hover:border-white/20 transition-all shadow-xl">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Edit Profile
          </h1>
          <p className="text-[#64748b] font-bold uppercase text-xs tracking-widest mt-1">
            Customize your presence
          </p>
        </div>
      </header>

      <Card className="bg-[#0f121a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 sm:p-12 space-y-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            <CoverImageSection
              src={coverImage.preview}
              processing={coverImage.processing}
              inputRef={coverImageInputRef}
              onChange={handleCoverImageChange}
              onRemove={() => {
                setCoverImage({ preview: null, processing: false });
                showSuccessToast(
                  "Cover image removed",
                  "Click Save Changes to apply",
                );
              }}
            />

            <ProfileImageSection
              src={profileImage.preview}
              displayInitial={`${user.firstName} ${user.lastName}`}
              processing={profileImage.processing}
              inputRef={profileImageInputRef}
              onChange={handleProfileImageChange}
              onRemove={() => {
                setProfileImage({ preview: null, processing: false });
                showSuccessToast(
                  "Profile image removed",
                  "Click Save Changes to apply",
                );
              }}
            />

            <UploadErrorAlert error={uploadError} />

            <div className="space-y-8 pt-6 border-t border-white/5">
              <EditProfileFields
                register={register}
                errors={errors}
                bioValue={watch("bio") || ""}
              />
            </div>

            <EditProfileActions
              isSubmitting={isSubmitting}
              profileProcessing={profileImage.processing}
              coverProcessing={coverImage.processing}
              onCancel={() => navigate(-1)}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
