import { Plus, Trash2, Download } from 'lucide-react';

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

interface SidebarProps {
    isOpen: boolean;
    conversations: Conversation[];
    currentConversationId: number | null;
    onSelectConversation: (id: number) => void;
    onCreateNew: () => void;
    onDeleteConversation: (id: number) => void;
    onExport: (id: number, format: 'markdown' | 'json') => void;
}

function Sidebar({
    isOpen,
    conversations,
    currentConversationId,
    onSelectConversation,
    onCreateNew,
    onDeleteConversation,
    onExport,
}: SidebarProps): JSX.Element {
    return (
        <div
            className={`${
                isOpen ? 'w-64' : 'w-0'
            } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
        >
            <div className='p-4 border-b border-gray-700'>
                <button
                    onClick={onCreateNew}
                    className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors'
                >
                    <Plus className='w-4 h-4' />
                    New Chat
                </button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-2'>
                <h3 className='text-xs font-semibold text-gray-400 uppercase px-2 mb-3'>Recent Conversations</h3>
                {conversations.length === 0 ? (
                    <p className='text-sm text-gray-400 px-2'>No conversations yet</p>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`group rounded-lg transition-colors ${
                                currentConversationId === conv.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                            }`}
                        >
                            <div className='p-3 flex items-start justify-between gap-2'>
                                <button
                                    onClick={() => onSelectConversation(conv.id)}
                                    className='flex-1 text-left text-sm truncate hover:underline'
                                >
                                    <div className='font-medium truncate'>{conv.title}</div>
                                    <div className='text-xs text-gray-400 mt-1'>{conv.message_count || 0} messages</div>
                                </button>
                                <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <button
                                        onClick={() => onExport(conv.id, 'markdown')}
                                        className='p-1 hover:bg-gray-700 rounded'
                                        title='Export as Markdown'
                                    >
                                        <Download className='w-3 h-3' />
                                    </button>
                                    <button
                                        onClick={() => onDeleteConversation(conv.id)}
                                        className='p-1 hover:bg-red-600 rounded'
                                        title='Delete'
                                    >
                                        <Trash2 className='w-3 h-3' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className='border-t border-gray-700 p-4 text-xs text-gray-400'>
                <p>Built with React + Express + SQLite</p>
            </div>
        </div>
    );
}

export default Sidebar;
