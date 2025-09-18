'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DebugSessionState() {
  const [mounted, setMounted] = useState(false);
  const { data: user, isLoading, error } = useSWR<User>('/api/user', fetcher);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔍 BugX Session Debug</div>
      <div>Loading: {isLoading ? '✅' : '❌'}</div>
      <div>User: {user ? '✅ ' + user.email : '❌ null'}</div>
      <div>Error: {error ? '❌ ' + error.message : '✅ none'}</div>
      <div className="text-gray-400 mt-1">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}