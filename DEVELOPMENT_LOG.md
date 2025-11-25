# Development Log - College Football Picks App

## Session Summary
**Date:** November 25, 2024
**Objective:** Build and refine a React Native (Expo) application for tracking College Football picks.

## Chronological History

### 1. Initial Setup & Debugging
- **Issue:** Encountered "Cannot find module 'react'" and other dependency errors.
- **Fix:** Installed missing dependencies (`react`, `react-native`, `expo`, etc.) and fixed `package.json` scripts.
- **Issue:** "process is not defined" error in browser.
- **Fix:** Added `polyfill.js` to mock global `process` variable for the browser environment.

### 2. Core Functionality Implementation
- **Feature:** Fetched games from `api.collegefootballdata.com`.
- **Feature:** Implemented `GameCard` component to display matchups, spreads, and scores.
- **Feature:** Created `PicksContext` to manage user picks and save them to `AsyncStorage`.
- **Logic:** Implemented win/loss/push calculation based on the spread.

### 3. UI Refinements & "Covers.com" Style Redesign
- **Design:** Switched to a cleaner, card-based layout inspired by Covers.com.
- **Selectors:** Added Year (arrow-based) and Week (scrollable pills) selectors.
- **Visuals:** Added "UPCOMING" and "FINAL" badges.
- **Feedback:** Added green/red highlighting for winning/losing picks.

### 4. Stats & Metrics
- **Feature:** Added Win-Loss-Push record (e.g., "2W 1L 0P").
- **Feature:** Added Money calculation (Wins = +$100, Losses = -$110).
- **Scope:** Implemented filtering stats by Week, Year, or All-Time.
- **Visibility:** Updated logic to show stats for all past weeks (even with 0 picks) but hide them for future weeks.

### 5. Dynamic Data Integration
- **Feature:** Replaced hardcoded team logos with dynamic fetching from the CFBD API (`/teams` endpoint).
- **Optimization:** Created `useTeamLogos` hook with caching to prevent excessive API calls.
- **Feature:** Added a "Search" bar to filter games by team name.

### 6. Deployment & Version Control
- **Action:** Initialized local Git repository.
- **Action:** Created `.gitignore` to exclude `node_modules` and build artifacts.
- **Action:** Pushed code to GitHub remote: `https://github.com/tsperoni/cfb`.

## Key Technical Decisions
- **State Management:** Used React Context (`PicksContext`) for global state (picks).
- **Data Fetching:** Custom hooks (`useGames`, `useTeamLogos`, `useCalendar`) for clean separation of concerns.
- **Persistence:** `AsyncStorage` used for persisting picks and caching API responses.
- **Styling:** `StyleSheet` for React Native styling, ensuring mobile responsiveness.
