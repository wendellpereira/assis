import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional, Any
from pathlib import Path


class ConversationStorage:
    """Manages persistent storage for conversations and settings using SQLite."""
    
    def __init__(self, db_path: str = "assis_data.db"):
        """Initialize the storage with a database path."""
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Create tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Conversations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL,
                    total_input_tokens INTEGER DEFAULT 0,
                    total_output_tokens INTEGER DEFAULT 0,
                    model_used TEXT
                )
            """)
            
            # Messages table
            cursor.execute("""
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
            """)
            
            # Settings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            """)
            
            # Create indexes for better query performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_conversation 
                ON messages(conversation_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_updated 
                ON conversations(updated_at DESC)
            """)
            
            conn.commit()
    
    # ==================== Conversation Management ====================
    
    def create_conversation(self, title: str = "New Conversation") -> int:
        """Create a new conversation and return its ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            now = datetime.now().isoformat()
            cursor.execute("""
                INSERT INTO conversations (title, created_at, updated_at)
                VALUES (?, ?, ?)
            """, (title, now, now))
            conn.commit()
            return cursor.lastrowid
    
    def update_conversation_title(self, conversation_id: int, title: str):
        """Update the title of a conversation."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE conversations 
                SET title = ?, updated_at = ?
                WHERE id = ?
            """, (title, datetime.now().isoformat(), conversation_id))
            conn.commit()
    
    def delete_conversation(self, conversation_id: int):
        """Delete a conversation and all its messages."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
            conn.commit()
    
    def get_all_conversations(self) -> List[Dict[str, Any]]:
        """Get all conversations ordered by most recently updated."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, created_at, updated_at, 
                       total_input_tokens, total_output_tokens, model_used,
                       (SELECT COUNT(*) FROM messages WHERE conversation_id = conversations.id) as message_count
                FROM conversations
                ORDER BY updated_at DESC
            """)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_conversation(self, conversation_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific conversation by ID."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, title, created_at, updated_at, 
                       total_input_tokens, total_output_tokens, model_used
                FROM conversations
                WHERE id = ?
            """, (conversation_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    # ==================== Message Management ====================
    
    def add_message(self, conversation_id: int, role: str, content: str, 
                   input_tokens: int = 0, output_tokens: int = 0):
        """Add a message to a conversation."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            now = datetime.now().isoformat()
            
            # Insert message
            cursor.execute("""
                INSERT INTO messages (conversation_id, role, content, timestamp, input_tokens, output_tokens)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (conversation_id, role, content, now, input_tokens, output_tokens))
            
            # Update conversation stats
            cursor.execute("""
                UPDATE conversations 
                SET updated_at = ?,
                    total_input_tokens = total_input_tokens + ?,
                    total_output_tokens = total_output_tokens + ?
                WHERE id = ?
            """, (now, input_tokens, output_tokens, conversation_id))
            
            conn.commit()
    
    def get_messages(self, conversation_id: int) -> List[Dict[str, Any]]:
        """Get all messages for a conversation."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, role, content, timestamp, input_tokens, output_tokens
                FROM messages
                WHERE conversation_id = ?
                ORDER BY timestamp ASC
            """, (conversation_id,))
            return [dict(row) for row in cursor.fetchall()]
    
    def update_conversation_model(self, conversation_id: int, model: str):
        """Update the model used for a conversation."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE conversations 
                SET model_used = ?
                WHERE id = ?
            """, (model, conversation_id))
            conn.commit()
    
    # ==================== Settings Management ====================
    
    def save_setting(self, key: str, value: Any):
        """Save a setting (converts value to JSON)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO settings (key, value)
                VALUES (?, ?)
            """, (key, json.dumps(value)))
            conn.commit()
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting (converts from JSON)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
            return default
    
    def delete_setting(self, key: str):
        """Delete a setting."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM settings WHERE key = ?", (key,))
            conn.commit()
    
    # ==================== Export/Import ====================
    
    def export_conversation_to_markdown(self, conversation_id: int) -> str:
        """Export a conversation to markdown format."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return ""
        
        messages = self.get_messages(conversation_id)
        
        md = f"# {conversation['title']}\n\n"
        md += f"**Created:** {conversation['created_at']}\n"
        md += f"**Updated:** {conversation['updated_at']}\n"
        if conversation['model_used']:
            md += f"**Model:** {conversation['model_used']}\n"
        md += f"**Total Tokens:** {conversation['total_input_tokens'] + conversation['total_output_tokens']}\n\n"
        md += "---\n\n"
        
        for msg in messages:
            role = "**You:**" if msg['role'] == 'user' else "**Assistant:**"
            md += f"{role}\n\n{msg['content']}\n\n---\n\n"
        
        return md
    
    def export_conversation_to_json(self, conversation_id: int) -> Dict[str, Any]:
        """Export a conversation to JSON format."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return {}
        
        messages = self.get_messages(conversation_id)
        
        return {
            "conversation": conversation,
            "messages": messages
        }
