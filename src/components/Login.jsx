'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';

// Reusable component for the Google Sign-in Button
const GoogleSignInButton = () => (
  <button
    type="button"
    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
    className="cursor-pointer group relative w-full flex items-center justify-center py-2 px-4 border border-green-600 rounded-lg bg-white hover:bg-green-50 transition-colors text-sm font-medium text-gray-900 shadow-sm"
    aria-label="Sign in with Google"
  >
    {/* Google G icon - kept the original colors for brand consistency */}
    <svg
      className="w-5 h-5 mr-3"
      viewBox="0 0 533.5 544.3"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.4 34.6-25.6 63.9-54.6 83.5v69.4h88.2c51.6-47.6 81-117.7 81-198z"
      />
      <path
        fill="#34A853"
        d="M272 544.3c73.6 0 135.5-24.1 180.7-65.4l-88.2-69.4c-24.6 16.5-56.2 26.3-92.5 26.3-71 0-131.2-48-152.6-112.2H28.6v70.6C74.3 485.7 167.9 544.3 272 544.3z"
      />
      <path
        fill="#FBBC05"
        d="M119.4 326.6c-6.2-18.5-9.8-38.2-9.8-58.6s3.6-40.1 9.8-58.6V139.1H28.6c-19.6 38.9-30.8 82.6-30.8 128.9s11.2 90 30.8 128.9l90.8-70.3z"
      />
      <path
        fill="#EA4335"
        d="M272 107.8c39.9 0 75.7 13.7 104 40.6l78-78C407.5 24.1 345.6 0 272 0 167.9 0 74.3 58.6 28.6 139.1l90.8 70.6C140.8 155.8 201 107.8 272 107.8z"
      />
    </svg>
    <span>Sign in with Google</span>
  </button>
);

const ForgotPasswordModal = ({
  isVisible,
  onClose,
  onSubmit,
  resetMessage,
  isSending,
}) => {
  const [email, setEmail] = useState('');

  if (!isVisible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border border-green-300">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Reset Password
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address to receive a password reset link.
        </p>

        {resetMessage && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 ${
              resetMessage.includes('sent')
                ? 'bg-green-100 text-green-800 border border-green-400'
                : 'bg-red-100 text-red-800 border border-red-400'
            }`}
          >
            {resetMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-gray-50 text-gray-900"
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-500"
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const [data, setData] = useState({ email: '', password: '' });
  const [pendingOtp, setPendingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigateToRegister = (e) => {
    e.preventDefault();
    router.push('/register');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pendingOtp) {
      // Step 1: verify password server-side via existing login check
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) {
        notify('error');
        return;
      }
      // Request OTP to email
      const r = await fetch('/api/auth/request-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      if (!r.ok) {
        notify('error');
        return;
      }
      toast.info(<p className="font-semibold">OTP sent to your email</p>);
      setPendingOtp(true);
      return;
    }

    // Step 2: verify OTP and complete NextAuth sign-in
    const v = await fetch('/api/auth/verify-login-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, code: otp }),
    });
    if (!v.ok) {
      toast.error(<p className="font-semibold">Invalid or expired OTP</p>);
      return;
    }
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      // password: data.password,
    });
    if (result?.error) notify('error');
    else {
      notify('success');
      router.push('/dashboard');
    }
  };

  const notify = (type) =>
    type === 'success'
      ? toast.success(<p className="font-semibold">Logged IN!!!</p>)
      : toast.error(<p className="font-semibold">Incorrect Credentials</p>);

  const handlePasswordResetSubmit = (email) => {
    setIsSending(true);
    setResetMessage('');

    console.log(`Sending reset request for: ${email}`);

    setTimeout(() => {
      setIsSending(false);

      // This is simulated success/failure. In a real app, this would be based on the API response.
      const success = true;

      if (success) {
        setResetMessage(
          `Success! If '${email}' is found, the reset link has been sent.`
        );

        setTimeout(() => {
          setIsForgotPasswordVisible(false);
          setResetMessage('');
        }, 5000);
      } else {
        setResetMessage(
          'Error: Could not send reset link. Please check the email address.'
        );
      }
    }, 1500);
  };

  const handleModalClose = () => {
    setIsForgotPasswordVisible(false);
    setResetMessage('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900">
      {/* Forgot Password Modal */}
      <ToastContainer />
      <ForgotPasswordModal
        isVisible={isForgotPasswordVisible}
        onClose={handleModalClose}
        onSubmit={handlePasswordResetSubmit}
        resetMessage={resetMessage}
        isSending={isSending}
      />

      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="flex gap-3 items-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <h2 className=" text-xl  font-bold text-[22px] text-gray-900">
              Sign in to Smart Cloud Storage
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            AI-Powered File Management
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Sign in with Google Button added here */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="flex items-center">
            <div className="w-full border-t border-gray-200" />
            <div className="px-3  text-sm text-gray-500">
              Or sign in with email
            </div>
            <div className="w-full border-t border-gray-200" />
          </div>

          <div className="flex flex-col gap-3 rounded-md shadow-sm">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={data.email}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-12 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder="Email address"
                // Removed rounded-none and -space-y-px from the parent div to fix input rounding
              />
            </div>
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={data.password}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="h-12 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder="Password"
                // Removed rounded-none and -space-y-px from the parent div to fix input rounding
              />
            </div>
          </div>

          {pendingOtp && (
            <div className="flex flex-col gap-2 mt-4">
              <label className="font-medium">Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit code"
                className="p-2 rounded-lg border-2"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                onClick={() => setIsForgotPasswordVisible(true)}
                className="font-medium text-green-600 hover:text-green-700 cursor-pointer"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-50 shadow-md"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Don't have an account?
          <a
            href="#"
            onClick={navigateToRegister}
            className="font-medium text-green-600 hover:text-green-700 ml-1 cursor-pointer"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
