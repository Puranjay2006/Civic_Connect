import React, { useState } from 'react';
import { getIssueById } from '../services/issueService';
import { getChatbotResponse } from '../services/geminiService';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Tracker: React.FC = () => {
  const [issueId, setIssueId] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'bot', text: "Hello! Please enter your complaint ID below to get the latest status." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: `Check ID: ${issueId}` };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const idToTrack = issueId.trim();
    setIssueId('');
    
    try {
      const issue = await getIssueById(idToTrack);
      const botResponseText = await getChatbotResponse(issue, idToTrack);
      const botMessage: Message = { sender: 'bot', text: botResponseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
       const errorMessage: Message = { sender: 'bot', text: "Sorry, I couldn't process your request right now." };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Track Your Issue</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Get real-time updates on your report using our AI assistant.</p>
        </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 h-96 overflow-y-auto flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && 
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                           <i className="fa-solid fa-robot text-lg text-white"></i>
                        </div>
                    }
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none'}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                </div>
            ))}
             {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                       <i className="fa-solid fa-robot text-lg text-white"></i>
                    </div>
                     <div className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 rounded-bl-none shadow-sm">
                         <div className="flex items-center gap-2">
                             <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                         </div>
                     </div>
                 </div>
             )}
        </div>
        <form onSubmit={handleTrackIssue} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-white dark:bg-slate-800">
          <input
            type="text"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            placeholder="Enter your complaint ID..."
            className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={isLoading || !issueId.trim()} className="bg-blue-600 text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-400 transition-colors shadow-sm">
             <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Tracker;