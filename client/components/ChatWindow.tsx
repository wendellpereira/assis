import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Message {
    id: number;
    role: string;
    content: string;
    timestamp: string;
    input_tokens: number;
    output_tokens: number;
}

interface ChatWindowProps {
    conversationId: number;
}

function ChatWindow({ conversationId }: ChatWindowProps): JSX.Element {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('claude-opus-4-1-20250805');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [systemMessage, setSystemMessage] = useState(
        'You are a helpful AI learning assistant that specializes in explaining AI concepts and helping with coding.'
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async (): Promise<void> => {
        try {
            const response = await fetch(`/api/messages/${conversationId}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setLoading(true);

        try {
            // Add user message to UI immediately
            const tempUserMessage: Message = {
                id: Date.now(),
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString(),
                input_tokens: 0,
                output_tokens: 0,
            };
            setMessages(prev => [...prev, tempUserMessage]);

            // Prepare messages for API
            const apiMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            }));
            apiMessages.push({ role: 'user', content: userMessage });

            // Stream response
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    messages: apiMessages,
                    model,
                    temperature,
                    maxTokens,
                    systemMessage,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            let assistantContent = '';
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.text) {
                                assistantContent += data.text;
                            }
                            if (data.done) {
                                // Message saved to DB by server
                            }
                        } catch {
                            // Ignore parse errors
                        }
                    }
                }
            }

            // Add assistant message
            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date().toISOString(),
                input_tokens: 0,
                output_tokens: 0,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col h-full'>
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                {messages.length === 0 ? (
                    <div className='flex items-center justify-center h-full text-gray-500'>
                        <p>Start a conversation by typing a message below</p>
                    </div>
                ) : (
                    messages.map(message => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-2xl px-4 py-3 rounded-lg ${
                                    message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                                }`}
                            >
                                <p className='whitespace-pre-wrap'>{message.content}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className='border-t border-gray-200 bg-white p-6'>
                <div className='mb-4 space-y-3'>
                    <div className='grid grid-cols-3 gap-3'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Model</label>
                            <select
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                            >
                                <option>claude-opus-4-1-20250805</option>
                                <option>claude-sonnet-4-5-20250929</option>
                                <option>claude-haiku-4-5-20251001</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Temperature: {temperature.toFixed(1)}
                            </label>
                            <input
                                type='range'
                                min='0'
                                max='1'
                                step='0.1'
                                value={temperature}
                                onChange={e => setTemperature(parseFloat(e.target.value))}
                                className='w-full'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Max Tokens</label>
                            <input
                                type='number'
                                min='100'
                                max='4096'
                                step='100'
                                value={maxTokens}
                                onChange={e => setMaxTokens(parseInt(e.target.value))}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                            />
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>System Message</label>
                        <textarea
                            value={systemMessage}
                            onChange={e => setSystemMessage(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-16 resize-none'
                        />
                    </div>
                </div>

                <div className='flex gap-3'>
                    <input
                        type='text'
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder='Ask me anything...'
                        disabled={loading}
                        className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2'
                    >
                        <Send className='w-4 h-4' />
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
