import { Router, Request, Response } from 'express';
import { ConversationStorage } from '../storage';

export function messageRoutes(storage: ConversationStorage): Router {
    const router = Router();

    // Get messages for a conversation
    router.get('/:conversationId', async (req: Request, res: Response) => {
        try {
            const messages = await storage.getMessages(parseInt(req.params.conversationId));
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    // Add message
    router.post('/', async (req: Request, res: Response) => {
        try {
            const { conversationId, role, content, inputTokens, outputTokens } = req.body;
            await storage.addMessage(conversationId, role, content, inputTokens || 0, outputTokens || 0);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add message' });
        }
    });

    return router;
}
