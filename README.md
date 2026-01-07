# 🤖 AI Learning Assistant

A modern React + Express + SQLite application for conversing with Claude AI. This is a complete rewrite of the original StreamLit app using modern web technologies.

## Tech Stack

-   **Frontend**: React 19 with Vite
-   **Backend**: Express.js (latest)
-   **Database**: SQLite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Linting**: ESLint
-   **AI**: Anthropic Claude API

## Features

-   💬 Real-time streaming chat with Claude
-   💾 Automatic conversation persistence to SQLite
-   🔄 Load and manage conversation history
-   📥 Export conversations as Markdown or JSON
-   ⚙️ Configurable model, temperature, and system prompts
-   🎨 Modern, responsive UI with Tailwind CSS
-   📊 Token usage tracking
-   🔐 Local-first architecture (all data stored locally)

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Anthropic API key

### Installation

1. Clone the repository:

```bash
cd /Users/wendell1/dev/assis
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### Development

Run both server and client in development mode:

```bash
npm run dev
```

This will start:

-   Backend server on `http://localhost:3000`
-   Frontend dev server on `http://localhost:5173`

### Building for Production

Build both frontend and backend:

```bash
npm run server:build
npm run client:build
```

## Project Structure

```
assis/
├── server/                 # Express backend
│   ├── index.ts           # Main server file
│   ├── storage.ts         # SQLite database layer
│   └── routes/            # API endpoints
│       ├── conversations.ts
│       ├── messages.ts
│       ├── settings.ts
│       └── chat.ts
├── client/                # React frontend
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Main app component
│   ├── index.css          # Global styles
│   ├── index.html         # HTML template
│   └── components/        # React components
│       ├── ChatWindow.tsx
│       ├── Sidebar.tsx
│       └── SettingsPanel.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .eslintrc.json
```

## API Endpoints

### Conversations

-   `GET /api/conversations` - List all conversations
-   `GET /api/conversations/:id` - Get specific conversation
-   `POST /api/conversations` - Create new conversation
-   `PUT /api/conversations/:id` - Update conversation title
-   `DELETE /api/conversations/:id` - Delete conversation
-   `GET /api/conversations/:id/export/markdown` - Export as Markdown
-   `GET /api/conversations/:id/export/json` - Export as JSON

### Messages

-   `GET /api/messages/:conversationId` - Get messages for conversation
-   `POST /api/messages` - Add message to conversation

### Settings

-   `GET /api/settings/:key` - Get setting value
-   `POST /api/settings` - Save setting
-   `DELETE /api/settings/:key` - Delete setting

### Chat

-   `POST /api/chat/stream` - Stream chat response (Server-Sent Events)

## Database Schema

### conversations

-   `id` - Primary key
-   `title` - Conversation title
-   `created_at` - Creation timestamp
-   `updated_at` - Last update timestamp
-   `total_input_tokens` - Sum of input tokens
-   `total_output_tokens` - Sum of output tokens
-   `model_used` - Last model used

### messages

-   `id` - Primary key
-   `conversation_id` - Foreign key to conversations
-   `role` - 'user' or 'assistant'
-   `content` - Message text
-   `timestamp` - Message timestamp
-   `input_tokens` - Input tokens for this message
-   `output_tokens` - Output tokens for this message

### settings

-   `key` - Setting key (primary key)
-   `value` - JSON-serialized value

## Environment Variables

```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

## Linting

Run ESLint:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

## License

MIT

## Notes

-   All conversations are stored locally in `assis_data.db`
-   The app uses Server-Sent Events (SSE) for streaming responses
-   Settings are persisted to the database and loaded on startup
-   The UI is fully responsive and works on mobile devices
