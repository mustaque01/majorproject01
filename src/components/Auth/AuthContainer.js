import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'
  const { login, register, error, isLoading, clearError } = useAuth();

  const handleLogin = async (loginData) => {
    clearError(); // Clear any previous errors
    
    const result = await login(loginData.email, loginData.password, loginData.role);
    
    if (result.success) {
      console.log('Login successful:', loginData);
      // The AuthContext will handle the state update and redirect
    } else {
      console.error('Login failed:', result.error);
      // Error is already set in the context
    }
  };

  const handleSignup = async (signupData) => {
    clearError(); // Clear any previous errors
    
    // Remove confirmPassword from the data before sending to API
    const { confirmPassword, ...registrationData } = signupData;
    
    const result = await register(registrationData);
    
    if (result.success) {
      console.log('Signup successful:', signupData);
      // The AuthContext will handle the state update and redirect
    } else {
      console.error('Signup failed:', result.error);
      // Error is already set in the context
    }
  };

  const switchToSignup = () => {
    clearError(); // Clear errors when switching views
    setCurrentView('signup');
  };

  const switchToLogin = () => {
    clearError(); // Clear errors when switching views
    setCurrentView('login');
  };

  return (
    <div className="auth-container">
      {currentView === 'login' ? (
        <Login 
          onSwitchToSignup={switchToSignup}
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
        />
      ) : (
        <Signup 
          onSwitchToLogin={switchToLogin}
          onSignup={handleSignup}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
        />
      )}
    </div>
  );
};

export default AuthContainer;