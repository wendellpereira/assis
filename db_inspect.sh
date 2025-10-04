#!/bin/bash
# SQLite Database Inspection Helper Script

echo "=== SQLite Database Inspector ==="
echo ""

# Check if database exists
if [ ! -f "assis_data.db" ]; then
    echo "❌ Database file 'assis_data.db' not found."
    echo "Run the app first to create it."
    exit 1
fi

echo "✓ Database found: assis_data.db"
echo ""

# Show all tables
echo "📋 Tables in database:"
sqlite3 assis_data.db ".tables"
echo ""

# Show schema for each table
echo "📐 Schema for conversations table:"
sqlite3 assis_data.db ".schema conversations"
echo ""

echo "📐 Schema for messages table:"
sqlite3 assis_data.db ".schema messages"
echo ""

echo "📐 Schema for settings table:"
sqlite3 assis_data.db ".schema settings"
echo ""

# Show counts
echo "📊 Row counts:"
echo -n "  Conversations: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM conversations;"
echo -n "  Messages: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM messages;"
echo -n "  Settings: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM settings;"
echo ""

# Show recent conversations
echo "💬 Recent conversations:"
sqlite3 assis_data.db -header -column "SELECT id, title, created_at, total_input_tokens + total_output_tokens as total_tokens FROM conversations ORDER BY updated_at DESC LIMIT 5;"
