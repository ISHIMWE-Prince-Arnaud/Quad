/**
 * Password validation utilities
 */

export interface PasswordRequirement {
  met: boolean;
  message: string;
}

export interface PasswordValidation {
  isValid: boolean;
  requirements: PasswordRequirement[];
}

/**
 * Validate password and return detailed requirements status
 */
export const validatePassword = (password: string): PasswordValidation => {
  const requirements: PasswordRequirement[] = [
    {
      met: password.length >= 8,
      message: 'At least 8 characters',
    },
    {
      met: /[A-Z]/.test(password),
      message: 'At least one uppercase letter',
    },
    {
      met: /[a-z]/.test(password),
      message: 'At least one lowercase letter',
    },
    {
      met: /\d/.test(password),
      message: 'At least one number',
    },
    {
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      message: 'At least one special character (!@#$%^&*)',
    },
  ];

  const isValid = requirements.every(req => req.met);

  return {
    isValid,
    requirements,
  };
};
