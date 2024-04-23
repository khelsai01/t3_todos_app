import { signIn } from 'next-auth/react';
import React from 'react';



const Login = () => {


  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: `${window.location.origin}/` });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-red-100 via-green-100 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl ">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to T3 Todo App</h1>
        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;