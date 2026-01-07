import { useState, useEffect } from 'react';
import { Menu, Plus, Trash2, Download, Settings } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';

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

function App(): JSX.Element {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async (): Promise<void> => {
        try {
            const response = await fetch('/api/conversations');
            const data = await response.json();
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            setLoading(false);
        }
    };

    const createNewConversation = async (): Promise<void> => {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'New Conversation' }),
            });
            const data = await response.json();
            setCurrentConversationId(data.id);
            await fetchConversations();
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const deleteConversation = async (id: number): Promise<void> => {
        try {
            await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
            if (currentConversationId === id) {
                setCurrentConversationId(null);
            }
            await fetchConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const exportConversation = async (id: number, format: 'markdown' | 'json'): Promise<void> => {
        try {
            const response = await fetch(`/api/conversations/${id}/export/${format}`);
            const data = await response.text();
            const blob = new Blob([data], {
                type: format === 'markdown' ? 'text/markdown' : 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversation.${format === 'markdown' ? 'md' : 'json'}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export conversation:', error);
        }
    };

    return (
        <div className='flex h-screen bg-gray-50'>
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={setCurrentConversationId}
                onCreateNew={createNewConversation}
                onDeleteConversation={deleteConversation}
                onExport={exportConversation}
            />

            {/* Main Content */}
            <div className='flex-1 flex flex-col'>
                {/* Header */}
                <header className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <Menu className='w-5 h-5' />
                        </button>
                        <h1 className='text-2xl font-bold text-gray-900'>🤖 AI Learning Assistant</h1>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                    >
                        <Settings className='w-5 h-5' />
                    </button>
                </header>

                {/* Content Area */}
                <div className='flex-1 overflow-hidden'>
                    {showSettings ? (
                        <SettingsPanel />
                    ) : currentConversationId ? (
                        <ChatWindow conversationId={currentConversationId} />
                    ) : (
                        <div className='h-full flex items-center justify-center'>
                            <div className='text-center'>
                                <p className='text-gray-500 mb-4'>No conversation selected</p>
                                <button
                                    onClick={createNewConversation}
                                    className='inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                                >
                                    <Plus className='w-4 h-4' />
                                    Start New Conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
