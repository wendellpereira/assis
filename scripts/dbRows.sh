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


# Show counts
echo "📊 Row counts:"
echo -n "  Conversations: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM conversations;"
echo -n "  Messages: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM messages;"
echo -n "  Settings: "
sqlite3 assis_data.db "SELECT COUNT(*) FROM settings;"
echo ""

