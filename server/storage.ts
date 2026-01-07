import sqlite3 from 'sqlite3';

interface Conversation {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    total_input_tokens: number;
    total_output_tokens: number;
    model_used: string | null;
    message_count?: number;
}

interface Message {
    id: number;
    conversation_id: number;
    role: string;
    content: string;
    timestamp: string;
    input_tokens: number;
    output_tokens: number;
}

export class ConversationStorage {
    private db: sqlite3.Database;

    constructor(dbPath: string = 'assis_data.db') {
        this.db = new sqlite3.Database(dbPath);
        this.initDatabase();
    }

    private initDatabase(): void {
        this.db.serialize(() => {
            // Conversations table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL,
          total_input_tokens INTEGER DEFAULT 0,
          total_output_tokens INTEGER DEFAULT 0,
          model_used TEXT
        )
      `);

            // Messages table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp TIMESTAMP NOT NULL,
          input_tokens INTEGER DEFAULT 0,
          output_tokens INTEGER DEFAULT 0,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
        )
      `);

            // Settings table
            this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

            // Indexes
            this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation
        ON messages(conversation_id)
      `);

            this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_conversations_updated
        ON conversations(updated_at DESC)
      `);
        });
    }

    // ==================== Conversation Management ====================

    async createConversation(title: string = 'New Conversation'): Promise<number> {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.db.run(
                'INSERT INTO conversations (title, created_at, updated_at) VALUES (?, ?, ?)',
                [title, now, now],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    async updateConversationTitle(conversationId: number, title: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.db.run(
                'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?',
                [title, now, conversationId],
                err => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async deleteConversation(conversationId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM conversations WHERE id = ?', [conversationId], err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async getAllConversations(): Promise<Conversation[]> {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT id, title, created_at, updated_at,
                total_input_tokens, total_output_tokens, model_used,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = conversations.id) as message_count
         FROM conversations
         ORDER BY updated_at DESC`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows as Conversation[]);
                }
            );
        });
    }

    async getConversation(conversationId: number): Promise<Conversation | null> {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT id, title, created_at, updated_at,
                total_input_tokens, total_output_tokens, model_used
         FROM conversations
         WHERE id = ?`,
                [conversationId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row as Conversation | null);
                }
            );
        });
    }

    // ==================== Message Management ====================

    async addMessage(
        conversationId: number,
        role: string,
        content: string,
        inputTokens: number = 0,
        outputTokens: number = 0
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();

            this.db.run(
                `INSERT INTO messages (conversation_id, role, content, timestamp, input_tokens, output_tokens)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [conversationId, role, content, now, inputTokens, outputTokens],
                err => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Update conversation stats
                    this.db.run(
                        `UPDATE conversations
             SET updated_at = ?,
                 total_input_tokens = total_input_tokens + ?,
                 total_output_tokens = total_output_tokens + ?
             WHERE id = ?`,
                        [now, inputTokens, outputTokens, conversationId],
                        updateErr => {
                            if (updateErr) reject(updateErr);
                            else resolve();
                        }
                    );
                }
            );
        });
    }

    async getMessages(conversationId: number): Promise<Message[]> {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT id, conversation_id, role, content, timestamp, input_tokens, output_tokens
         FROM messages
         WHERE conversation_id = ?
         ORDER BY timestamp ASC`,
                [conversationId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows as Message[]);
                }
            );
        });
    }

    async updateConversationModel(conversationId: number, model: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE conversations SET model_used = ? WHERE id = ?', [model, conversationId], err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // ==================== Settings Management ====================

    async saveSetting(key: string, value: unknown): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                [key, JSON.stringify(value)],
                err => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async getSetting(key: string, defaultValue: unknown = null): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT value FROM settings WHERE key = ?',
                [key],
                (err, row: { value: string } | undefined) => {
                    if (err) reject(err);
                    else if (row) resolve(JSON.parse(row.value));
                    else resolve(defaultValue);
                }
            );
        });
    }

    async deleteSetting(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM settings WHERE key = ?', [key], err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // ==================== Export ====================

    async exportConversationToMarkdown(conversationId: number): Promise<string> {
        const conversation = await this.getConversation(conversationId);
        if (!conversation) return '';

        const messages = await this.getMessages(conversationId);

        let md = `# ${conversation.title}\n\n`;
        md += `**Created:** ${conversation.created_at}\n`;
        md += `**Updated:** ${conversation.updated_at}\n`;
        if (conversation.model_used) {
            md += `**Model:** ${conversation.model_used}\n`;
        }
        md += `**Total Tokens:** ${conversation.total_input_tokens + conversation.total_output_tokens}\n\n`;
        md += '---\n\n';

        for (const msg of messages) {
            const role = msg.role === 'user' ? '**You:**' : '**Assistant:**';
            md += `${role}\n\n${msg.content}\n\n---\n\n`;
        }

        return md;
    }

    async exportConversationToJSON(conversationId: number): Promise<object> {
        const conversation = await this.getConversation(conversationId);
        if (!conversation) return {};

        const messages = await this.getMessages(conversationId);

        return {
            conversation,
            messages,
        };
    }
}
