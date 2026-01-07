# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/wendell1/dev/assis
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

This will start:

-   **Backend**: http://localhost:3000
-   **Frontend**: http://localhost:5173

The frontend will automatically proxy API requests to the backend.

## Project Structure

```
assis/
├── server/                    # Express backend (TypeScript)
│   ├── index.ts              # Main server entry
│   ├── storage.ts            # SQLite database layer
│   └── routes/               # API endpoints
│       ├── conversations.ts  # Conversation CRUD
│       ├── messages.ts       # Message management
│       ├── settings.ts       # Settings persistence
│       └── chat.ts           # AI chat streaming
│
├── client/                    # React frontend (TypeScript)
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app component
│   ├── index.html            # HTML template
│   ├── index.css             # Global styles (Tailwind)
│   └── components/
│       ├── ChatWindow.tsx    # Chat interface
│       ├── Sidebar.tsx       # Conversation list
│       └── SettingsPanel.tsx # Settings UI
│
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite bundler config
├── tailwind.config.js        # Tailwind CSS config
├── postcss.config.js         # PostCSS config
└── .eslintrc.json            # ESLint config
```

## Database

The app uses SQLite with three main tables:

### conversations

-   Stores conversation metadata
-   Tracks token usage and model used
-   Auto-indexed by updated_at for fast queries

### messages

-   Stores individual messages
-   Links to conversations via foreign key
-   Tracks input/output tokens per message

### settings

-   Persists user preferences (model, temperature, etc.)
-   JSON-serialized values

Database file: `assis_data.db` (created automatically)

## API Endpoints

### Conversations

-   `GET /api/conversations` - List all
-   `GET /api/conversations/:id` - Get one
-   `POST /api/conversations` - Create
-   `PUT /api/conversations/:id` - Update title
-   `DELETE /api/conversations/:id` - Delete
-   `GET /api/conversations/:id/export/markdown` - Export as MD
-   `GET /api/conversations/:id/export/json` - Export as JSON

### Messages

-   `GET /api/messages/:conversationId` - Get messages
-   `POST /api/messages` - Add message

### Settings

-   `GET /api/settings/:key` - Get setting
-   `POST /api/settings` - Save setting
-   `DELETE /api/settings/:key` - Delete setting

### Chat

-   `POST /api/chat/stream` - Stream AI response (Server-Sent Events)

## Development Commands

```bash
# Run both server and client
npm run dev

# Run only server
npm run server:dev

# Run only client
npm run client:dev

# Build for production
npm run server:build
npm run client:build

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Preview production build
npm run preview
```

## Features

✅ Real-time streaming responses from Claude
✅ Automatic conversation persistence
✅ Load/manage conversation history
✅ Export conversations (Markdown/JSON)
✅ Configurable model and parameters
✅ Token usage tracking
✅ Settings persistence
✅ Modern React UI with Tailwind CSS
✅ TypeScript for type safety
✅ ESLint for code quality

## Troubleshooting

### Port already in use

If port 3000 or 5173 is already in use, update `PORT` in `.env` or modify `vite.config.ts`

### Database locked

If you get SQLite "database is locked" errors, ensure only one instance is running

### Missing API key

The app will show an error if `ANTHROPIC_API_KEY` is not set in `.env`

### Build issues

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173 in your browser
3. Add your Anthropic API key in settings
4. Start chatting!

All conversations are automatically saved to the local SQLite database.
