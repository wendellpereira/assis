# Storage & Persistence Feature Guide

## Overview

The AI Assistant now includes a comprehensive storage and persistence system that automatically saves all conversations, settings, and usage statistics to a local SQLite database.

## Features

### 1. **Auto-Save Conversations**
- Every message is automatically saved as you chat
- No manual save button needed
- Conversations persist across app restarts

### 2. **Conversation Management**

#### Create New Conversation
- Click **"➕ New Conversation"** in the sidebar
- Or start chatting without selecting a conversation
- First message becomes the conversation title (can be renamed)

#### Load Past Conversations
- View up to 10 recent conversations in the sidebar
- Click any conversation to load its complete history
- Active conversation marked with ▶ indicator

#### Rename Conversations
- Edit the "Conversation Title" field when a conversation is active
- Click **"💾 Save Title"** to update

#### Delete Conversations
- Click the **❌** button next to any conversation
- Confirmation not required (use with caution!)
- Deletes conversation and all associated messages

#### Clear Current Session
- Click the **🗑️** button to clear the current chat
- Doesn't delete from database, just clears the screen
- Start fresh while keeping history

### 3. **Settings Persistence**
Your preferences are automatically remembered:
- Model selection
- Temperature
- Max tokens
- System message preset

Click **"💾 Save Settings"** to persist your current configuration across sessions.

### 4. **Export Conversations**

#### Markdown Export
- Clean, readable format
- Includes metadata (created/updated dates, model, token count)
- Perfect for sharing or archiving
- Click **"📄 Markdown"** to download

#### JSON Export
- Structured data format
- Includes all conversation and message details
- Useful for data analysis or importing elsewhere
- Click **"📋 JSON"** to download

### 5. **Usage Statistics**
Track your API usage:
- Input tokens per conversation
- Output tokens per conversation
- Total tokens across all conversations
- Model used for each conversation

## Database Schema

### Tables

**conversations**
- `id`: Unique identifier
- `title`: Conversation name
- `created_at`: When conversation started
- `updated_at`: Last message timestamp
- `total_input_tokens`: Cumulative input tokens
- `total_output_tokens`: Cumulative output tokens
- `model_used`: AI model identifier

**messages**
- `id`: Unique identifier
- `conversation_id`: Links to conversation
- `role`: "user" or "assistant"
- `content`: Message text
- `timestamp`: When message was sent
- `input_tokens`: Tokens for this message (input)
- `output_tokens`: Tokens for this message (output)

**settings**
- `key`: Setting name
- `value`: Setting value (JSON encoded)

## File Storage

- **Database Location**: `assis_data.db` in the app directory
- **Format**: SQLite 3
- **Gitignored**: Yes, database files are excluded from version control
- **Backup**: Copy the `.db` file to backup all data

## Code Architecture

### storage.py
The `ConversationStorage` class provides all database operations:

```python
storage = ConversationStorage()  # Initialize

# Conversation management
conv_id = storage.create_conversation("My Chat")
storage.update_conversation_title(conv_id, "New Title")
conversations = storage.get_all_conversations()
storage.delete_conversation(conv_id)

# Message management
storage.add_message(conv_id, "user", "Hello!", input_tokens=5)
messages = storage.get_messages(conv_id)

# Settings
storage.save_setting("temperature", 0.7)
temp = storage.get_setting("temperature", default=0.5)

# Export
markdown = storage.export_conversation_to_markdown(conv_id)
json_data = storage.export_conversation_to_json(conv_id)
```

### Integration Points in assis.py

1. **Initialization** (line 21): `storage = ConversationStorage()`
2. **Sidebar UI** (lines 39-136): Conversation list and management
3. **Settings Load** (lines 119-122): Restore saved preferences
4. **Auto-save** (lines 280-307): Save after each message exchange

## Best Practices

1. **Regular Exports**: Periodically export important conversations
2. **Database Backups**: Copy `assis_data.db` to backup your data
3. **Naming Conventions**: Use descriptive titles for easy searching
4. **Cleanup**: Delete old/test conversations to keep the list manageable

## Future Enhancements

Potential features to add:
- Search across all conversations
- Conversation folders/tags
- Import conversations from JSON
- Database compression/optimization
- Cloud sync support
- Conversation branching/forking
- Usage analytics dashboard
- Cost tracking by conversation

## Troubleshooting

### Database locked error
- Close other instances of the app
- Check file permissions on `assis_data.db`

### Conversations not loading
- Check if `assis_data.db` exists
- Verify database isn't corrupted (try SQLite browser)

### Settings not persisting
- Click "💾 Save Settings" after making changes
- Check for errors in terminal/console

### Missing conversations
- Verify you didn't delete them
- Check if multiple database files exist
- Ensure app is running from correct directory

## Technical Details

- **Database**: SQLite 3 (bundled with Python)
- **Transactions**: Auto-commit for each operation
- **Indexes**: Optimized for conversation list queries
- **Concurrency**: Thread-safe for single app instance
- **Data Validation**: None currently (add as needed)
- **Migrations**: Manual (no auto-migration system yet)
