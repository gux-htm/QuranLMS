# TILP - Tajweed Integrated Learning Platform

A modern web application for Quranic education, enabling teachers to assign lessons and track student progress while giving students clear visibility into their Quran completion journey.

## Features

- **Teacher Dashboard**: Manage classes, track attendance, create lessons, and monitor student progress
- **Student Dashboard**: Track personal progress, view calendar, access reports, and earn achievements
- **Calendar-based Scheduling**: Clear visibility of daily targets and actual completion
- **Progress Tracking**: Detailed metrics on Quran completion and tajweed mastery
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom TILP design tokens
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── layout/      # Layout components (TeacherLayout, StudentLayout)
│   └── ui/          # Reusable UI components (Button, Card, Input)
├── pages/           # Page components organized by user role
├── lib/             # Utilities and mock data
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## Design System

### Colors
- **Green**: Primary action and success (interactive elements)
- **Clay**: Secondary action and warnings
- **Gold**: Information and highlights
- **Sky**: Additional emphasis
- **Paper/Ink**: Background and text hierarchy

### Typography
- **Display**: Source Serif 4 (headings)
- **Body**: Inter (content)
- **Arabic**: Noto Naskh Arabic (Quranic text)

## License

Copyright © 2025 TILP. All rights reserved.
