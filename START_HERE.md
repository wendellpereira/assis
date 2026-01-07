# 🚀 START HERE

Welcome to your new React + Express AI Assistant app!

## What You Have

Your StreamLit app has been converted to a modern, production-ready stack:

-   **Frontend**: React 19 with Vite
-   **Backend**: Express with TypeScript
-   **Database**: SQLite (same as before)
-   **Styling**: Tailwind CSS
-   **AI**: Anthropic Claude API

## 3-Step Setup

### Step 1: Install Dependencies

```bash
cd /Users/wendell1/dev/assis
npm install
```

### Step 2: Add Your API Key

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Step 3: Start Development

```bash
npm run dev
```

Then open: **http://localhost:5173**

## Documentation Map

Choose what you need:

| Document               | Purpose                                |
| ---------------------- | -------------------------------------- |
| **QUICKSTART.md**      | 30-second setup & common commands      |
| **SETUP.md**           | Detailed setup & troubleshooting       |
| **README.md**          | Full project documentation             |
| **MIGRATION.md**       | How StreamLit → React conversion works |
| **PROJECT_SUMMARY.md** | Complete project overview              |

## Key Features

✅ Real-time AI chat with Claude
✅ Auto-save conversations to SQLite
✅ Export as Markdown or JSON
✅ Configurable model & parameters
✅ Token usage tracking
✅ Modern, responsive UI

## Project Structure

```
assis/
├── server/              # Express backend
│   ├── index.ts        # Server entry
│   ├── storage.ts      # Database layer
│   └── routes/         # API endpoints
├── client/             # React frontend
│   ├── App.tsx         # Main component
│   ├── components/     # React components
│   └── index.html      # HTML template
├── package.json        # Dependencies
└── [config files]      # TypeScript, Vite, Tailwind, ESLint
```

## Common Commands

```bash
npm run dev              # Start everything
npm run lint             # Check code quality
npm run lint:fix         # Fix issues automatically
npm run server:build     # Build backend
npm run client:build     # Build frontend
```

## URLs

-   **Frontend**: http://localhost:5173
-   **Backend API**: http://localhost:3000
-   **API Health**: http://localhost:3000/api/health

## Database

-   **File**: `assis_data.db` (SQLite)
-   **Auto-created** on first run
-   **Compatible** with your existing StreamLit database

To use your old conversations:

```bash
cp /Users/wendell1/dev/assis-StreamLit/assis_data.db /Users/wendell1/dev/assis/
```

## Troubleshooting

**Port in use?**

```bash
# Change PORT in .env
PORT=3001
```

**Dependencies not installing?**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Need help?**

-   Check `SETUP.md` for detailed troubleshooting
-   Run `npm run lint` to check for issues
-   Review `README.md` for full documentation

## Next Steps

1. ✅ Run `npm install`
2. ✅ Set `ANTHROPIC_API_KEY` in `.env`
3. ✅ Run `npm run dev`
4. ✅ Open http://localhost:5173
5. ✅ Start chatting!

## Tech Stack

-   React 19 + Vite
-   Express + TypeScript
-   SQLite
-   Tailwind CSS
-   Lucide Icons
-   ESLint

## Questions?

1. **Quick reference?** → Read `QUICKSTART.md`
2. **Setup help?** → Read `SETUP.md`
3. **How it works?** → Read `README.md`
4. **Coming from StreamLit?** → Read `MIGRATION.md`
5. **Full overview?** → Read `PROJECT_SUMMARY.md`

---

**Ready to go?** Run `npm run dev` now! 🚀

All files are in `/Users/wendell1/dev/assis/`
