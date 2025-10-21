import jwt from 'jsonwebtoken';

/**
 * Generate access token (short-lived: 15 minutes)
 */
export const generateAccessToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ userId }, jwtSecret, {
    expiresIn: '15m', // 15 minutes
  });
};

/**
 * Generate refresh token (long-lived: 7 days)
 */
export const generateRefreshToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ userId, type: 'refresh' }, jwtSecret, {
    expiresIn: '7d', // 7 days
  });
};

/**
 * Verify and decode refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string; type: string } | null => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string; type: string };
    
    // Verify it's a refresh token
    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};
