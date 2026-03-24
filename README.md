# AnimeStream-Tracker

AnimeStream-Tracker is a comprehensive, open-source, full-stack web application designed for privately tracking and streaming anime right from your desktop. 

By acting as a unified client, AnimeStream-Tracker bridges the gap between your MyAnimeList (MAL) profile and video playback. It provides direct, synchronized account tracking alongside custom-built API scraping techniques to bypass the need for external video players or VPN software.

> **Disclaimer:** This project was created exclusively for educational purposes to demonstrate web app architecture, third-party API OAuth integration, and web-scraping logic. The developer does not endorse, support, or encourage piracy in any form. 

---

## 🚀 How It Works

### The Core Loop
1. **Authentication:** Users connect their existing MyAnimeList (MAL) account securely via OAuth.
2. **Discovery & Data:** The app aggregates data using the official MAL API and the open-source Jikan API. The UI seamlessly mirrors the user’s currently "Watching" lists, recommendations, and bookmarks.
3. **Playback:** Instead of relying on vulnerable server-side streaming API services, AnimeStream-Tracker implements a custom **Ani-CLI** equivalent scraper on the backend. This directly queries available host networks and extracts `.m3u8` video streams, streaming them directly to a custom frontend interface.
4. **Synchronization:** View progress and ratings given in the custom UI immediately fire a `PUT` request back to MyAnimeList, keeping lists 100% updated automatically.

### Scraper Engine (Anti-Restriction)
To circumvent ISP blocks without forcing users onto VPNs, the custom backend utilizes robust request libraries (`curl-cffi` / `got` with HTTP/2). By spoofing TLS fingerprints and browser headers (origin, referer, mobile user-agent), the scraper mimics real browser traffic—making it significantly harder for regional firewalls to flag or intercept the video streams.

## 🛠️ Tech Stack & Architecture

- **Framework:** [Next.js (App Router)](https://nextjs.org/) & React 18
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a sleek, dark-mode, glassmorphic aesthetic.
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for fluid transitions and micro-interactions.
- **Player:** Implementation of `hls.js` supporting direct stream manipulation.
- **Storage Strategy (Local First):** Leveraging IndexedDB and LocalStorage to privately cache search results, reduce redundant API pings, and save heavy bandwidth.

## 🚦 Getting Started

### Prerequisites
Before running, you must obtain API credentials from MyAnimeList. 

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Alpha-224/AnimeStream-Tracker.git
   cd AnimeStream-Tracker
   ```
2. Set up your environment variables. Never commit your `.env` or `.env.local` files! Create one at the root directory:
   ```env
   # .env.local
   MAL_CLIENT_ID=your_client_id_here
   MAL_CLIENT_SECRET=your_client_secret_here
   ```
3. Install missing dependencies:
   ```bash
   npm install
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
   
Open [http://localhost:3000](http://localhost:3000) in your web browser.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Remember that all integrations must respect local storage environments and avoid exposing client data.
