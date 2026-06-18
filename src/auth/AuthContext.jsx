import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  restoreSession,
  getMe,
} from '../services/authService';
import { saveUser } from '../storage/authStorage';
import { disconnectSocket } from '../socket/socketClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const restoredUser = await restoreSession();
      setUser(restoredUser);
      setLoading(false);
    }
    init();
  }, []);

  const loginUser = useCallback(async (email, password) => {
    const { user: loggedUser } = await loginService(email, password);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const registerUser = useCallback(async (data) => {
    const { user: registeredUser } = await registerService(data);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logoutUser = useCallback(() => {
    disconnectSocket();
    logoutService();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const updatedUser = await getMe();
    saveUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
