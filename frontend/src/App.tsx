import React, { useState, useRef, useEffect } from 'react';

type ChatMessageSender = 'user' | 'copilot';

interface Message {
  id: string;
  sender: ChatMessageSender;
  text: string;
}

interface AskResponse {
  answer: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'copilot', text: 'Azure Operations Copilot initialized. System status: SECURE (Private VNet). How can I assist with your infrastructure troubleshooting today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text }),
      });
      
      const data = (await response.json()) as AskResponse;
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'copilot', text: data.answer }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'copilot', text: '⚠️ Connection Error: Failed to reach the private cluster backend service.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-semibold tracking-wide text-slate-200">Azure Operations Copilot</h1>
        </div>
        <div className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800 rounded-md">
          Zero-Trust Environment
        </div>
      </header>

      {/* Main Chat Display */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3 rounded-lg text-sm shadow-md whitespace-pre-line leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-900 text-slate-300 border border-slate-800 rounded-bl-none'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-50">
                {msg.sender === 'user' ? 'You' : 'System Copilot'}
              </div>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-lg text-sm animate-pulse">
              Querying isolated search index & grounding context...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Bottom Input Area */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your infrastructure (e.g., 'Why is my VM unreachable?')"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run Diagnostic
          </button>
        </form>
      </footer>
    </div>
  );
}
