import { Router, Request, Response } from 'express';
import { ConversationStorage } from '../storage';

export function conversationRoutes(storage: ConversationStorage): Router {
    const router = Router();

    // Get all conversations
    router.get('/', async (_req: Request, res: Response) => {
        try {
            const conversations = await storage.getAllConversations();
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    });

    // Get specific conversation
    router.get('/:id', async (req: Request, res: Response) => {
        try {
            const conversation = await storage.getConversation(parseInt(req.params.id));
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            res.json(conversation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch conversation' });
        }
    });

    // Create conversation
    router.post('/', async (req: Request, res: Response) => {
        try {
            const { title } = req.body;
            const id = await storage.createConversation(title || 'New Conversation');
            res.status(201).json({ id });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create conversation' });
        }
    });

    // Update conversation title
    router.put('/:id', async (req: Request, res: Response) => {
        try {
            const { title } = req.body;
            await storage.updateConversationTitle(parseInt(req.params.id), title);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update conversation' });
        }
    });

    // Delete conversation
    router.delete('/:id', async (req: Request, res: Response) => {
        try {
            await storage.deleteConversation(parseInt(req.params.id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete conversation' });
        }
    });

    // Export to markdown
    router.get('/:id/export/markdown', async (req: Request, res: Response) => {
        try {
            const markdown = await storage.exportConversationToMarkdown(parseInt(req.params.id));
            res.setHeader('Content-Type', 'text/markdown');
            res.send(markdown);
        } catch (error) {
            res.status(500).json({ error: 'Failed to export conversation' });
        }
    });

    // Export to JSON
    router.get('/:id/export/json', async (req: Request, res: Response) => {
        try {
            const json = await storage.exportConversationToJSON(parseInt(req.params.id));
            res.json(json);
        } catch (error) {
            res.status(500).json({ error: 'Failed to export conversation' });
        }
    });

    return router;
}
