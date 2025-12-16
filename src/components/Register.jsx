// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';

// const MFASuccessBanner = ({ onSetupMFA, onContinueToLogin }) => (
//   <div
//     className="p-4 bg-green-100 border-l-4 border-green-500 text-green-800 shadow-md mb-6 rounded-md"
//     role="alert"
//   >
//     <p className="font-bold">Registration Successful!</p>
//     <p className="text-sm">
//       Please check your email. For enhanced security, we highly recommend
//       setting up Multi-Factor Authentication (MFA) now.
//     </p>
//     <div className="mt-3 flex space-x-3">
//       <button
//         onClick={onSetupMFA}
//         className="text-sm font-medium bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition-colors"
//       >
//         Enable MFA Now
//       </button>
//       <button
//         onClick={onContinueToLogin}
//         className="text-sm font-medium text-green-600 py-1 px-3 rounded border border-green-600 hover:bg-green-50 transition-colors"
//       >
//         Continue to Login
//       </button>
//     </div>
//   </div>
// );

// const Register = () => {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [isSuccess, setIsSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const navigateToLogin = (e) => {
//     e.preventDefault();
//     router.push('/login');
//   };

//   const handleMFAEnable = () => {
//     alert('Redirecting to the secure MFA setup route...');
//     router.push('/login');
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       alert('Passwords do not match!');
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           fullName: formData.fullName.trim(),
//           email: formData.email.trim().toLowerCase(),
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.error || 'Registration failed');
//         return;
//       }

//       setIsSuccess(true);
//       setFormData({
//         fullName: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//       });
//     } catch (err) {
//       alert('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900">
//       <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
//         {isSuccess && (
//           <MFASuccessBanner
//             onSetupMFA={handleMFAEnable}
//             onContinueToLogin={navigateToLogin}
//           />
//         )}

//         <div className={`space-y-6 ${isSuccess ? 'mt-4' : 'mt-0'}`}>
//           <div className="flex gap-2 items-center">
//             <svg
//               className="w-8 h-8 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"
//               />
//             </svg>
//             <h2 className="text-xl font-bold text-[20px] text-gray-900">
//               Create Your Smart Cloud Account
//             </h2>
//           </div>

//           <p className="flex items-center ml-8 text-sm text-gray-600">
//             Start using AI-Powered File Management today.
//           </p>

//           <form className="mt-8 space-y-4" onSubmit={handleRegisterSubmit}>
//             <div className="rounded-md shadow-sm space-y-4">
//               <input
//                 name="fullName"
//                 required
//                 placeholder="Full Name / Username"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />

//               <input
//                 name="email"
//                 type="email"
//                 required
//                 placeholder="Email address"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />

//               <input
//                 name="password"
//                 type="password"
//                 required
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />

//               <input
//                 name="confirmPassword"
//                 type="password"
//                 required
//                 placeholder="Confirm Password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="cursor-pointer w-full py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
//             >
//               Register Account
//             </button>
//           </form>

//           <div className="text-center text-sm text-gray-600">
//             Already have an account?
//             <a
//               href="#"
//               onClick={navigateToLogin}
//               className="font-medium text-green-600 hover:text-green-700 ml-1"
//             >
//               Sign in
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ================= GOOGLE BUTTON ================= */
const GoogleSignInButton = () => (
  <button
    type="button"
    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
    className="cursor-pointer group relative w-full flex items-center justify-center py-2 px-4 border border-green-600 rounded-lg bg-white hover:bg-green-50 transition-colors text-sm font-medium text-gray-900 shadow-sm"
  >
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

/* ================= SUCCESS BANNER ================= */
const MFASuccessBanner = ({ onContinueToLogin }) => (
  <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-800 shadow-md mb-6 rounded-md">
    <p className="font-bold">Registration Successful!</p>
    <p className="text-sm">You can now sign in to your account.</p>
    <button
      onClick={onContinueToLogin}
      className="mt-3 text-sm font-medium text-green-600 py-1 px-3 rounded border border-green-600 hover:bg-green-50"
    >
      Continue to Login
    </button>
  </div>
);

/* ================= REGISTER PAGE ================= */
const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigateToLogin = (e) => {
    e.preventDefault();
    router.push('/login');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success('Account created successfully');
      setIsSuccess(true);

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900">
      <ToastContainer position="top-right" />

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
        {isSuccess && <MFASuccessBanner onContinueToLogin={navigateToLogin} />}

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Create Your Smart Cloud Account
          </h2>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            {/* GOOGLE SIGN IN */}
            <GoogleSignInButton />

            <div className="flex items-center">
              <div className="w-full border-t border-gray-200" />
              <div className="px-3 text-sm text-gray-500">
                Or register with email
              </div>
              <div className="w-full border-t border-gray-200" />
            </div>

            <input
              name="fullName"
              required
              placeholder="Full Name / Username"
              value={formData.fullName}
              onChange={handleChange}
              className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
            />

            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
            />

            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-12 w-full px-3 py-2 border rounded-lg bg-gray-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-2 px-4 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Register Account
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Already have an account?
            <a
              href="#"
              onClick={navigateToLogin}
              className="font-medium text-green-600 hover:text-green-700 ml-1"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
