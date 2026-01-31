import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type EditProfileFormData = {
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
};

export function EditProfileFields({
  register,
  errors,
  bioValue,
}: {
  register: UseFormRegister<EditProfileFormData>;
  errors: FieldErrors<EditProfileFormData>;
  bioValue: string;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...register("username")}
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
          {...register("bio")}
          placeholder="Tell us about yourself..."
          rows={4}
          className="resize-none"
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>
    </>
  );
}
