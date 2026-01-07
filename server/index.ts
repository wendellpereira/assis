import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConversationStorage } from './storage';
import { conversationRoutes } from './routes/conversations';
import { messageRoutes } from './routes/messages';
import { settingsRoutes } from './routes/settings';
import { chatRoutes } from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize storage
const storage = new ConversationStorage();

// Routes
app.use('/api/conversations', conversationRoutes(storage));
app.use('/api/messages', messageRoutes(storage));
app.use('/api/settings', settingsRoutes(storage));
app.use('/api/chat', chatRoutes(storage));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
