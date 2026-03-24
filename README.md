# AnimeStream-Tracker

A full-stack, locally hosted web application for browsing, tracking, and streaming anime. The app acts as a private client that syncs directly with the user's MyAnimeList (MAL) account while utilizing a scraper API for video playback.

## Features

- **Global Navigation:** Persistent left sidebar with Homepage, Currently Watching, and Recommended sections.
- **MyAnimeList Sync:** Connects to MAL for tracking, rating, and managing your anime list.
- **Discovery Hub:** Homepage features trending, popular, currently airing, and recently finished anime.
- **Detail & Viewer Hub:** Deep dive into anime info, view posters, synopses, and stream directly using a custom scraper.
- **Ani-CLI Scraper Core:** Direct scraping logic for video streams, circumventing the need for a VPN, mimicking browser TLS fingerprints.
- **Privacy & Storage First:** Local storage & IndexedDB to cache watch history and reduce redundant API calls.

## Tech Stack

- **Frontend:** Next.js (App Router), React
- **Styling:** Tailwind CSS (Dark Mode), Framer Motion
- **Player:** ReactPlayer / Video.js supporting HLS
- **APIs:** MAL API, Jikan API, Consumet API, Ani-CLI scraper implementation

## Getting Started

1. Clone the repository.
2. Ensure you have the required environment variables (MAL API client ID, etc.).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
