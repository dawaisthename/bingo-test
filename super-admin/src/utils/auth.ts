import {jwtDecode} from 'jwt-decode';

interface TokenPayload {
  type: number;
}

export const getUserType = (): number | null => {
  const token = localStorage.getItem('token'); // Adjust the key if different
  if (!token) return null;

  try {
    const decoded: TokenPayload = jwtDecode(token);
    return decoded.type;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
