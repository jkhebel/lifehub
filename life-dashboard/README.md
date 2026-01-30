# Life Dashboard

A personal dashboard for tracking and visualizing major goals and areas of your life using interactive bullseye diagrams.

## Features

- **Bullseye Navigation**: Navigate through hierarchical life areas using an interactive bullseye diagram
- **Customizable Trackers**: Add metrics to track progress in each area (numbers, percentages, levels, progress bars)
- **Progress Aggregation**: Child area and tracker progress automatically rolls up to parent areas
- **Persistent Storage**: Data is saved to localStorage automatically
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Structure

The app organizes life areas in a tree structure. Example:

```
Life
├── Professional
├── Health
│   └── Fitness
├── Social
└── Hobbies
    └── Languages
        ├── Japanese
        ├── French
        └── Hindi
```

Each area can have:
- **Sub-areas**: Nested categories that contribute to parent progress
- **Trackers**: Metrics like "WaniKani Level", "Kanji Known", "Vocab Known"

## Tracker Types

- **Number**: Simple count (e.g., "Projects Completed: 12")
- **Percentage**: 0-100% value (e.g., "Satisfaction: 75%")
- **Level**: Level-based progress (e.g., "WaniKani Level 15/60")
- **Progress**: Progress bar with target (e.g., "Kanji: 450/2136")
- **Boolean**: Yes/No toggle

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Local Storage for persistence
