
import { Header } from '@/components/header';
import Link from 'next/link';

const Home = () => {

  
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Welcome to T3 Todo App</h1>
        <Link
          href={"/organization"}
          className="block w-full max-w-xs mx-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Show Organization
        </Link>
      </div>
    </div>

  );
};


export default Home;

