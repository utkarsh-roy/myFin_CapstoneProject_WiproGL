import { jwtDecode } from 'jwt-decode';

/**
 * Validates a JWT token to check if it's expired
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - True if token is valid and not expired, false otherwise
 */
export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token expiration time is greater than current time
    if (decodedToken.exp < currentTime) {
      return false; // Token is expired
    }
    
    return true; // Token is valid
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

/**
 * Decodes a JWT token to extract user details
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
