# EigoKit Teacher App

Web application for teachers to manage students, content, surveys, and view insights.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Fill in your environment variables:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key_here  # "Publishable key" in Project Settings > API keys
```

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

## Features

- **Student Management**: Add, edit, delete students, reset authentication
- **Content Management**: Add vocabulary and grammar rules
- **Survey Management**: Create and manage survey questions
- **Dashboard**: View class metrics and student insights
- **Theming**: Supports school-specific branding

## Deployment

Deploy to Vercel, Netlify, Render, or any static hosting service.
