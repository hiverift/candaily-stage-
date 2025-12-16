import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Hook to use the auth anywhere
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking for logged-in user (replace with real auth later)
  useEffect(() => {
    // For now: fake a logged-in user (change or remove this later)
    const fakeUser = {
      id: 'user123',
      email: 'samunder@example.com',
      name: 'Samunder',           // This will be the dynamic host name
      fullName: 'Samunder Singh',
      username: 'samunder',
    };

    // Simulate async auth check (e.g., checking localStorage, Firebase, etc.)
    setTimeout(() => {
      setUser(fakeUser);  // Remove or replace with real auth logic
      setLoading(false);
    }, 500);

    // Real example (uncomment when you add real auth):
    // Check localStorage for token/user
    // const storedUser = localStorage.getItem('user');
    // if (storedUser) setUser(JSON.parse(storedUser));
    // setLoading(false);
  }, []);

  // Optional: login/logout functions
  const login = (userData) => {
    setUser(userData);
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}