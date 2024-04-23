import { signIn, signOut, useSession } from "next-auth/react";


export const Header = () => {
  const { data: session } = useSession();
  

  const customName: string[] | undefined = session?.user?.name?.split(" ");

  const handleSignOut = async () => {
    await signOut({callbackUrl: `${window.location.origin}/`});
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: `${window.location.origin}/` });
  };
  return (
    <div className="w-full flex justify-between px-2 py-4 bg-gradient-to-r from-red-100 via-green-100 to-blue-200 shadow-lg relative">
      <div className="text-sm md:text-base lg:text-xl text-center font-bold text-gray-800">T3 TODO APP</div>
      <div className="flex items-center">
        {session?.user ? (
          <div className="flex items-center gap-2">
            <h2 className="text-indigo-900 text-lg md:text-lg lg:text-2xl font-bold border-yellow-50 p-2 text-center">{customName?.[0] ?? ''}</h2>
            <img src={session.user?.image ?? ''} alt="profile" className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full" />
            <button onClick={handleSignOut} className="bg-indigo-500 px-3 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 border-2 rounded border-yellow-50 text-white font-semibold hover:bg-indigo-600 transition-colors duration-300 focus:outline-none">Sign Out</button>
          </div>
        ) : (
          <button onClick={handleGoogleSignIn} className="bg-blue-500 px-3 py-1 md:px-4 md:py-2 lg:px-4 lg:py-2 border-2 rounded border-yellow-50 text-white font-semibold hover:bg-blue-600 transition-colors duration-300 focus:outline-none">Sign In</button>
        )}
      </div>
    </div>
  );
};