# Setup Guide

## Prerequisites

1. Install Node.js and npm
   - Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
   - This will also install npm (Node Package Manager)
   - Recommended version: Node.js 18.x or later

2. Verify installation
   ```bash
   node --version
   npm --version
   ```

## Project Setup

1. Install project dependencies
   ```bash
   npm install react@latest react-dom@latest
   npm install @types/react@latest @types/react-dom@latest typescript@latest
   npm install tailwindcss@latest postcss@latest autoprefixer@latest
   npm install @vitejs/plugin-react@latest vite@latest
   npm install framer-motion@latest recharts@latest zustand@latest
   npm install react-router-dom@latest react-icons@latest
   npm install @emotion/react@latest @emotion/styled@latest
   ```

2. Initialize Tailwind CSS
   ```bash
   npx tailwindcss init -p
   ```

3. Start development server
   ```bash
   npm run dev
   ```

4. Build for production
   ```bash
   npm run build
   ```

## Development

The project will be running at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
daily-habit-checklist/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts      # Vite configuration
```

## Features

- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Recharts for data visualization
- ✅ Zustand for state management
- ✅ React Router for navigation
- ✅ Dark/Light theme support
- ✅ Responsive design
- ✅ Local storage persistence 