import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { ConversationStorage } from '../storage';

export function chatRoutes(storage: ConversationStorage): Router {
    const router = Router();

    // Stream chat message
    router.post('/stream', async (req: Request, res: Response) => {
        try {
            const { conversationId, messages, model, temperature, maxTokens, systemMessage } = req.body;

            if (!process.env.ANTHROPIC_API_KEY) {
                res.status(400).json({ error: 'API key not configured' });
                return;
            }

            const client = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let fullResponse = '';
            let usage = { input_tokens: 0, output_tokens: 0 };

            const stream = await client.messages.stream({
                model,
                max_tokens: maxTokens,
                temperature,
                messages,
                system: systemMessage,
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    fullResponse += chunk.delta.text;
                    res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
                }

                if (chunk.type === 'message_delta' && chunk.usage) {
                    usage = {
                        input_tokens: chunk.usage.input_tokens ?? 0,
                        output_tokens: chunk.usage.output_tokens ?? 0,
                    };
                }
            }

            // Get final message for model info
            const finalMessage = await stream.finalMessage();
            const modelUsed = finalMessage.model;

            // Save to database
            if (conversationId) {
                const userMessage = messages[messages.length - 1];
                await storage.addMessage(conversationId, 'user', userMessage.content, 0, 0);
                await storage.addMessage(
                    conversationId,
                    'assistant',
                    fullResponse,
                    usage.input_tokens,
                    usage.output_tokens
                );
                await storage.updateConversationModel(conversationId, modelUsed);
            }

            res.write(
                `data: ${JSON.stringify({
                    done: true,
                    usage,
                    model: modelUsed,
                })}\n\n`
            );
            res.end();
        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ error: 'Failed to process chat' });
        }
    });

    return router;
}
