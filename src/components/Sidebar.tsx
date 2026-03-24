import Link from 'next/link';
import { Home, Tv, Compass, LogIn, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import SearchBar from './SearchBar';

export default async function Sidebar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mal_token')?.value;
  const isAuthenticated = !!token;

  return (
    <aside className="w-64 h-screen bg-black/90 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 z-40">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          ANIME
        </h1>
      </div>

      {/* Search bar inside sidebar */}
      <div className="px-4 pb-4">
        <SearchBar />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Homepage</span>
        </Link>
        <Link
          href="/currently-watching"
          className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <Tv className="w-5 h-5" />
          <span>Watching</span>
        </Link>
        <Link
          href="/recommendations"
          className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <Compass className="w-5 h-5" />
          <span>Recommended</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        {isAuthenticated ? (
          <a
            href="/api/auth/logout"
            className="flex items-center w-full space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout MAL</span>
          </a>
        ) : (
          <a
            href="/api/auth/login"
            className="flex items-center w-full space-x-3 px-4 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>Login with MAL</span>
          </a>
        )}
      </div>
    </aside>
  );
}
