// pages/login.js

import Head from 'next/head';
import Login from '@/components/Login';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Smart Cloud Storage</title>
        <meta
          name="description"
          content="Login to your AI-powered smart cloud storage"
        />
        <link rel="icon" href="/favicon.ico" /> {/* Update with your favicon */}
      </Head>

      {/* The Login component will handle the visual layout */}
      <Login />
    </>
  );
}
