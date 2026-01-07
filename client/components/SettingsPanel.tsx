import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const MODEL_OPTIONS = ['claude-opus-4-1-20250805', 'claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001'];

const SYSTEM_PRESETS = {
    Default:
        'You are a helpful AI learning assistant that specializes in explaining AI concepts and helping with coding.',
    'Code Tutor':
        'You are an expert programming tutor. Provide code examples, explain concepts step by step, and focus on best practices.',
    'AI Teacher':
        'You are an AI learning companion. Break down complex topics, use analogies, and encourage hands-on experimentation.',
    'Project Mentor':
        'You are a project mentor helping build and improve this AI assistant. Suggest improvements, explain architectural decisions, and guide development.',
};

function SettingsPanel(): JSX.Element {
    const [model, setModel] = useState('claude-opus-4-1-20250805');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [preset, setPreset] = useState('Default');
    const [systemMessage, setSystemMessage] = useState(SYSTEM_PRESETS.Default);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async (): Promise<void> => {
        try {
            const [modelRes, tempRes, tokensRes, presetRes] = await Promise.all([
                fetch('/api/settings/model'),
                fetch('/api/settings/temperature'),
                fetch('/api/settings/max_tokens'),
                fetch('/api/settings/preset'),
            ]);

            const modelData = await modelRes.json();
            const tempData = await tempRes.json();
            const tokensData = await tokensRes.json();
            const presetData = await presetRes.json();

            if (modelData.value) setModel(modelData.value);
            if (tempData.value) setTemperature(tempData.value);
            if (tokensData.value) setMaxTokens(tokensData.value);
            if (presetData.value) {
                setPreset(presetData.value);
                setSystemMessage(
                    SYSTEM_PRESETS[presetData.value as keyof typeof SYSTEM_PRESETS] || SYSTEM_PRESETS.Default
                );
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async (): Promise<void> => {
        try {
            await Promise.all([
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'model', value: model }),
                }),
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'temperature', value: temperature }),
                }),
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'max_tokens', value: maxTokens }),
                }),
                fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'preset', value: preset }),
                }),
            ]);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <div className='h-full overflow-y-auto p-8 bg-white'>
            <div className='max-w-2xl'>
                <h2 className='text-3xl font-bold mb-8'>⚙️ Settings</h2>

                <div className='space-y-6'>
                    {/* Model Selection */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Model</label>
                        <select
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            {MODEL_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preset Selection */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>System Message Preset</label>
                        <select
                            value={preset}
                            onChange={e => {
                                setPreset(e.target.value);
                                setSystemMessage(SYSTEM_PRESETS[e.target.value as keyof typeof SYSTEM_PRESETS]);
                            }}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        >
                            {Object.keys(SYSTEM_PRESETS).map(key => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* System Message */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>System Message</label>
                        <textarea
                            value={systemMessage}
                            onChange={e => setSystemMessage(e.target.value)}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none'
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
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
                        <p className='text-xs text-gray-500 mt-1'>Higher = more creative, Lower = more focused</p>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Max Tokens</label>
                        <input
                            type='number'
                            min='100'
                            max='4096'
                            step='100'
                            value={maxTokens}
                            onChange={e => setMaxTokens(parseInt(e.target.value))}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>

                    {/* Save Button */}
                    <div className='flex gap-3 pt-4'>
                        <button
                            onClick={saveSettings}
                            className='flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                        >
                            <Save className='w-4 h-4' />
                            Save Settings
                        </button>
                        {saved && <div className='flex items-center text-green-600'>✓ Settings saved!</div>}
                    </div>
                </div>

                {/* Info Section */}
                <div className='mt-12 p-6 bg-blue-50 rounded-lg'>
                    <h3 className='font-semibold text-blue-900 mb-3'>ℹ️ About This App</h3>
                    <ul className='text-sm text-blue-800 space-y-2'>
                        <li>• Built with React 19, Vite, Express, and SQLite</li>
                        <li>• All conversations are saved locally to the database</li>
                        <li>• Your settings are persisted across sessions</li>
                        <li>• Powered by Anthropic's Claude API</li>
                        <li>• Open source and ready to extend</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SettingsPanel;
