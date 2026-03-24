# DEVELOPMENT GUIDELINES & CONSTRAINTS

## 1. Do's (Mandatory Execution Rules)
* **Component Isolation:** Build strict, modular React components. The Video Player logic must be entirely separated from the Data Fetching logic.
* **Graceful Degradation:** If the Consumet API fails to find a stream for an episode, display a sleek, dark-themed error state within the player container, not a full-page crash.
* **Rate Limit Handling:** The Jikan API has strict rate limits. Implement a debouncer or delay for all search bar inputs, and cache responses heavily in IndexedDB to prevent 429 Too Many Requests errors.
* **OAuth Security:** Handle the MyAnimeList OAuth2 PKCE flow securely. Store access tokens in HTTP-only cookies or encrypted local storage.
* **HLS Support:** Ensure the video player explicitly utilizes `hls.js` under the hood, as standard HTML5 video tags cannot natively play `.m3u8` streams on most desktop browsers.

## 2. Don'ts (Strict Prohibitions)
* **No Mock Video Data:** Do not use placeholder videos (like Big Buck Bunny). The player must connect to the Consumet API from the very first implementation. If the API is down, show the error state.
* **No Bright Themes:** Never use pure white backgrounds or bright, glaring colors. The UI must remain high-contrast dark (e.g., slate greys, deep blacks, neon accents).
* **No "Dud" Updates:** Never update the UI to show an anime as "Rated" or "Watched" unless the `200 OK` response has been successfully received from the official MAL API. The local state must mirror the true remote state.
* **No Infinite Scrolling on Episodes:** Adhere strictly to the 15-item pagination rule for the episode list. Do not implement infinite scroll here to avoid DOM bloat.
* **No Forced Source Selection:** Do not prompt the user with a modal to pick a video source before playing. The app must autonomously pick the best stream and start playing immediately upon clicking "Watch Now."

## 3. Workflow for Antigravity Agent
1.  **Plan:** Generate the Implementation Plan Artifact for the OAuth flow first. Await user approval.
2.  **Execute UI:** Build the layout components using Tailwind.
3.  **Integrate:** Connect Jikan for reading, MAL for writing, and Consumet for video.
4.  **Verify:** Use the Antigravity integrated browser to log into a test MAL account, attempt to rate an anime, and verify the network tab shows the successful API request.