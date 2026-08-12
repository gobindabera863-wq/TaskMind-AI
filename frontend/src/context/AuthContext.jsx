import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('taskmind_token');
      const savedUser = localStorage.getItem('taskmind_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const freshUser = await authService.getMe();
          setUser(freshUser);
        } catch (error) {
          console.error('Session expired or invalid token', error);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const loginUser = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.token) setUser(data);
    return data;
  };

  const registerUser = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    if (data.token) setUser(data);
    return data;
  };

  const verifyOTPUser = async (email, otp) => {
    const data = await authService.verifyOTP(email, otp);
    if (data.token) setUser(data);
    return data;
  };

  const resendOTPUser = async (email) => {
    return await authService.resendOTP(email);
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        verifyOTP: verifyOTPUser,
        resendOTP: resendOTPUser,
        logout: logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
