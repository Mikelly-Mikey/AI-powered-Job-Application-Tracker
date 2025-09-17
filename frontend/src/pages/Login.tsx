import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { authAPI, handleApiError } from '../utils/api';
import toast from 'react-hot-toast';

interface LoginFormData {
  username: string;
  password: string;
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>();
  const signupForm = useForm<SignupFormData>();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      const { tokens, user } = response.data;
      
      localStorage.setItem('access', tokens.access);
      localStorage.setItem('refresh', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(data);
      const { tokens, user } = response.data;
      
      localStorage.setItem('access', tokens.access);
      localStorage.setItem('refresh', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-3 rounded-full shadow-lg">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Sign in to your AI-powered job tracker' 
              : 'Start tracking your job applications with AI insights'
            }
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="card-body">
            {isLogin ? (
              /* Login Form */
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...loginForm.register('username', { 
                        required: 'Username or email is required' 
                      })}
                      type="text"
                      className={`input pl-10 ${loginForm.formState.errors.username ? 'input-error' : ''}`}
                      placeholder="Enter your username or email"
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-error-600">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...loginForm.register('password', { 
                        required: 'Password is required' 
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${loginForm.formState.errors.password ? 'input-error' : ''}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-error-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full btn-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner h-5 w-5 mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      {...signupForm.register('first_name', { 
                        required: 'First name is required' 
                      })}
                      type="text"
                      className={`input ${signupForm.formState.errors.first_name ? 'input-error' : ''}`}
                      placeholder="John"
                    />
                    {signupForm.formState.errors.first_name && (
                      <p className="mt-1 text-sm text-error-600">
                        {signupForm.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      {...signupForm.register('last_name', { 
                        required: 'Last name is required' 
                      })}
                      type="text"
                      className={`input ${signupForm.formState.errors.last_name ? 'input-error' : ''}`}
                      placeholder="Doe"
                    />
                    {signupForm.formState.errors.last_name && (
                      <p className="mt-1 text-sm text-error-600">
                        {signupForm.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...signupForm.register('username', { 
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Username can only contain letters, numbers, and underscores'
                        }
                      })}
                      type="text"
                      className={`input pl-10 ${signupForm.formState.errors.username ? 'input-error' : ''}`}
                      placeholder="johndoe"
                    />
                  </div>
                  {signupForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-error-600">
                      {signupForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...signupForm.register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      className={`input pl-10 ${signupForm.formState.errors.email ? 'input-error' : ''}`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-error-600">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...signupForm.register('password', { 
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${signupForm.formState.errors.password ? 'input-error' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-error-600">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...signupForm.register('confirm_password', { 
                        required: 'Please confirm your password',
                        validate: (value) => {
                          const password = signupForm.getValues('password');
                          return value === password || 'Passwords do not match';
                        }
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${signupForm.formState.errors.confirm_password ? 'input-error' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirm_password && (
                    <p className="mt-1 text-sm text-error-600">
                      {signupForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full btn-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner h-5 w-5 mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            )}

            {/* Toggle between login and signup */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-primary-600 hover:text-primary-500 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 p-2 rounded-full mb-2">
                <SparklesIcon className="h-4 w-4 text-primary-600" />
              </div>
              <span>AI-Powered</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-success-100 p-2 rounded-full mb-2">
                <svg className="h-4 w-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Job Tracking</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Insights</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}