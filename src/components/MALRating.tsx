'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function MALRating({ animeId, initialScore }: { animeId: string; initialScore?: number }) {
  const [score, setScore] = useState(initialScore || 0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleRate(value: number) {
    if (loading) return;
    setLoading(true);
    try {
      // Create a Next.js API route that handles the PUT request using the server-side MAL token
      const res = await fetch('/api/mal/rate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animeId, score: value }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/api/auth/login';
          return;
        }
        // Silently handle throwing the error so we just alert the user without triggering unhandled console stack traces
        throw { message: 'Failed to update rating on MAL' };
      }

      // Only update local UI if API call actually succeeded
      setScore(value);
    } catch (err) {
      // Don't console.error to avoid scaring users with stack traces; the alert is enough
      alert('Failed to rate on MyAnimeList. Are you logged in?');
    } finally {
      setLoading(false);
    }
  }

  const scoreOptions = [
    { value: 0, label: 'Select Rating' },
    { value: 10, label: '10 - Masterpiece' },
    { value: 9, label: '9 - Great' },
    { value: 8, label: '8 - Very Good' },
    { value: 7, label: '7 - Good' },
    { value: 6, label: '6 - Fine' },
    { value: 5, label: '5 - Average' },
    { value: 4, label: '4 - Bad' },
    { value: 3, label: '3 - Very Bad' },
    { value: 2, label: '2 - Horrible' },
    { value: 1, label: '1 - Appalling' },
  ];

  return (
    <div className="flex flex-col items-start space-y-2 mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
      <label htmlFor="mal-rating" className="text-slate-400 text-sm font-medium">Your MAL Rating</label>
      <div className="flex space-x-2 items-center w-full">
        <select
          id="mal-rating"
          value={score}
          onChange={(e) => handleRate(Number(e.target.value))}
          disabled={loading}
          className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
        >
          {scoreOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {loading && <span className="text-xs text-blue-400 animate-pulse whitespace-nowrap">Syncing...</span>}
      </div>
    </div>
  );
}
