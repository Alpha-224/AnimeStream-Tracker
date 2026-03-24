# MISSION OBJECTIVE
Build a full-stack, locally hosted web application for browsing, tracking, and streaming anime. The app acts as a private client that syncs directly with the user's MyAnimeList (MAL) account while utilizing a scraper API for video playback.

## TECH STACK
* **Frontend/Framework:** Next.js (App Router) using React.
* **Styling:** Tailwind CSS (Dark mode default, high-contrast, modern sleek aesthetic).
* **Animations:** Framer Motion (for flashy, modern UI transitions).
* **Video Player:** ReactPlayer or Video.js (must support `.m3u8` HLS streams via `hls.js`).
* **Data APIs:** * MAL API (for OAuth authentication, reading user lists, and writing rating/episode updates).
    * Jikan API (unofficial MAL API for fast, unauthenticated reads of popular/airing anime).
    * Consumet API (for scraping direct `.m3u8` streaming links).
* **Storage:** LocalStorage / IndexedDB (for caching watch history and minimizing redundant network requests).



## UI/UX ARCHITECTURE & LAYOUT

### 1. Global Navigation (Persistent Left Sidebar)
* **Aesthetic:** Glassmorphic or solid high-contrast dark grey/black.
* **Links:** * **Homepage:** The main discovery hub.
    * **Currently Watching:** Pulled from the user's MAL "Watching" list.
    * **Recommended:** Generated based on MAL recommendations.
* **Footer Area:** MAL Profile connection status and OAuth login/logout button.

### 2. Homepage (Discovery Hub)
* **Layout:** Horizontal, Netflix-style scrolling rows. 
* **Categories:** * Currently Popular (Trending).
    * All-Time Popular.
    * Currently Airing.
    * Recently Finished.
* **Card Design:** High-resolution vertical posters. On hover, apply a subtle scale-up animation and display the anime title. Clicking the card navigates to the Anime Detail Page.

### 3. Anime Detail Page (The Hub)
* **Header:** Large hero banner (backdrop from MAL/Jikan) with a blurred overlay.
* **Left/Center Column (Information):**
    * Anime Poster.
    * Title, short synopsis (extracted from MAL), and total episode count.
    * Current MAL Rating & IMDb Rating (if fetchable, otherwise omit IMDb).
    * **User Action:** A visually distinct UI (e.g., star rating or dropdown) to rate the anime *directly* on their MAL account via the API.
    * **"Watch Now" Button:** Large, glowing primary button that navigates to the Viewer Page.
* **Right Column (Episode Selection):**
    * A single-column table list of episodes with their titles.
    * Pagination: Display exactly 15 episodes per page (scrollable or clickable page numbers).
    * Top Right of Column: A search icon that expands into a text input. Must search the episode list by both name and number dynamically.

### 4. Anime Viewer Page (The Theater)
* **Center Stage (The Player):**
    * A large, cinematic video player.
    * **Controls needed:** Quality selection (720p, 1080p, etc.), playback speed, volume, and fullscreen.
    * **Source Logic:** The app must automatically select the highest quality/lowest latency `.m3u8` stream from Consumet API on load.
    * **Source Selector:** A dropdown menu allowing the user to manually switch video sources if the default stream buffers or fails.
* **Below Player (Actions):**
    * Display the specific *episode's* rating from MAL (if available).
    * Provide a UI to rate this specific episode (which triggers a PUT request to MAL).



## DATA & SYNCING LOGIC
* **Local First:** Cache search results, episode lists, and watch history in IndexedDB. Only hit the APIs when data is stale or when explicitly performing a write action (like updating a rating).
* **MAL Sync:** Any rating given on the UI *must* trigger an authenticated API call to physically update the user's actual MyAnimeList account. It cannot just be a local UI update.


## UPDATED BACKEND: THE "ANI-CLI" SCRAPER
* **Objective:** Bypass ISP blocks WITHOUT a VPN by mimicking ani-cli's direct scraping method.
* **Core Library:** Use `curl-cffi` (if using Python) or `got` with `http2` (if using Node.js) to mimic a browser's TLS Fingerprint.
* **Scraper Logic:** 1. Implement the exact scraping logic from `pystardust/ani-cli`. 
    2. Instead of standard HTML parsing, use Regex to extract the 'embed' links from the page source.
    3. Target the 'MegaCloud' and 'RapidCloud' sources specifically, as they bypass most regional blocks.
* **Header Spoofing:** Every request must include:
    - `User-Agent`: A mobile browser string (e.g., iPhone/Safari).
    - `Referer`: The base domain of the anime site.
    - `Origin`: The base domain.