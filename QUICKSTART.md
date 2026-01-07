# Quick Start Guide

## 30-Second Setup

```bash
cd /Users/wendell1/dev/assis
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Common Commands

```bash
# Start development (both server and client)
npm run dev

# Start only backend server
npm run server:dev

# Start only frontend
npm run client:dev

# Build for production
npm run server:build
npm run client:build

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project URLs

-   **Frontend**: http://localhost:5173
-   **Backend API**: http://localhost:3000
-   **API Health Check**: http://localhost:3000/api/health

## File Structure

```
assis/
├── server/              # Backend (Express + TypeScript)
│   ├── index.ts        # Server entry point
│   ├── storage.ts      # Database layer
│   └── routes/         # API endpoints
├── client/             # Frontend (React + TypeScript)
│   ├── main.tsx        # React entry point
│   ├── App.tsx         # Main component
│   └── components/     # React components
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite config
```

## Key Features

-   💬 Real-time AI chat with Claude
-   💾 Auto-save conversations to SQLite
-   📥 Export as Markdown or JSON
-   ⚙️ Configurable model & parameters
-   📊 Token usage tracking
-   🎨 Modern Tailwind CSS UI

## Environment Variables

```bash
ANTHROPIC_API_KEY=your_key_here
PORT=3000
NODE_ENV=development
```

## Database

-   **File**: `assis_data.db` (SQLite)
-   **Tables**: conversations, messages, settings
-   **Auto-created** on first run

## Troubleshooting

### Port 3000 or 5173 in use?

```bash
# Change port in .env
PORT=3001
```

### Dependencies not installing?

```bash
rm -rf node_modules package-lock.json
npm install
```

### Database issues?

```bash
# Delete and recreate
rm assis_data.db
npm run dev
```

## Tech Stack

-   **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
-   **Backend**: Express, TypeScript, SQLite
-   **AI**: Anthropic Claude API
-   **Tools**: ESLint, Lucide Icons

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set API key in `.env`
3. ✅ Start dev server: `npm run dev`
4. ✅ Open http://localhost:5173
5. ✅ Start chatting!

## Documentation

-   `README.md` - Full project documentation
-   `SETUP.md` - Detailed setup instructions
-   `MIGRATION.md` - StreamLit → React migration guide

## Support

For issues or questions:

1. Check the README.md
2. Review SETUP.md troubleshooting section
3. Check ESLint output: `npm run lint`
4. Verify API key is set in `.env`
