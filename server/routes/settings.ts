import { Router, Request, Response } from 'express';
import { ConversationStorage } from '../storage';

export function settingsRoutes(storage: ConversationStorage): Router {
    const router = Router();

    // Get setting
    router.get('/:key', async (req: Request, res: Response) => {
        try {
            const value = await storage.getSetting(req.params.key);
            res.json({ value });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch setting' });
        }
    });

    // Save setting
    router.post('/', async (req: Request, res: Response) => {
        try {
            const { key, value } = req.body;
            await storage.saveSetting(key, value);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to save setting' });
        }
    });

    // Delete setting
    router.delete('/:key', async (req: Request, res: Response) => {
        try {
            await storage.deleteSetting(req.params.key);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete setting' });
        }
    });

    return router;
}
