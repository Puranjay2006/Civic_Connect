
import React, { useState, useEffect } from 'react';
import { getIssueById, getIssuesByUser } from '../services/issueService';
import { getChatbotResponse } from '../services/geminiService';
import { CivicIssue, Status, User } from '../types';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  issueList?: { id: string; title: string; status: Status }[];
  issueDetails?: CivicIssue | null;
}

interface TrackerProps {
  currentUser: User | null;
}

const Tracker: React.FC<TrackerProps> = ({ currentUser }) => {
  const [issueId, setIssueId] = useState('');
  const [allIssues, setAllIssues] = useState<CivicIssue[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIssueSelector, setShowIssueSelector] = useState(false);
  const [selectedIssueForMap, setSelectedIssueForMap] = useState<CivicIssue | null>(null);

  useEffect(() => {
    // Load only the current user's issues
    if (!currentUser) {
      setMessages([
        { sender: 'bot', text: "Hello! 👋 I'm Casey, your AI assistant. Please log in to track your reported issues!" }
      ]);
      return;
    }
    
    const issues = getIssuesByUser(currentUser.id);
    setAllIssues(issues);
    
    // Initial welcome message with user's issue list
    if (issues.length > 0) {
      setMessages([
        { 
          sender: 'bot', 
          text: `Hello! 👋 I'm Casey, your AI assistant. I found ${issues.length} issue(s) that you've reported. You can select an issue below or type an Issue ID to get a detailed status update.`,
          issueList: issues.map(i => ({ id: i.id, title: i.title, status: i.status }))
        }
      ]);
    } else {
      setMessages([
        { sender: 'bot', text: "Hello! 👋 I'm Casey, your AI assistant. You haven't reported any issues yet. Once you report an issue, you can track its status here! 📝" }
      ]);
    }
  }, [currentUser]);

  const handleSelectIssue = (selectedId: string) => {
    setIssueId(selectedId);
    setShowIssueSelector(false);
    // Trigger the tracking automatically
    handleTrackIssueById(selectedId);
  };

  const handleTrackIssueById = async (id: string) => {
    if (!id.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: `Check status for: ${id}` };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIssueId('');
    
    try {
      const issue = getIssueById(id.trim());
      
      // Generate response locally if API fails
      let botResponseText: string;
      
      try {
        botResponseText = await getChatbotResponse(issue, id.trim());
      } catch (apiError) {
        // Fallback to local response if API fails
        if (issue) {
          const statusMessages: Record<Status, string> = {
            [Status.Pending]: `Your issue "${issue.title}" has been received and is currently in the queue for review. Our team will look into it soon! 📋`,
            [Status.InProgress]: `Great news! Your issue "${issue.title}" is being actively worked on by our ${issue.department} department. We're on it! 🔧`,
            [Status.Resolved]: `Wonderful! Your issue "${issue.title}" has been resolved. Thank you for your patience! If you have any feedback, please let us know. ✅`
          };
          botResponseText = statusMessages[issue.status];
          
          // Add timing info
          if (issue.acknowledgedAt) {
            const ackTime = new Date(issue.acknowledgedAt).toLocaleDateString();
            botResponseText += `\n\n📅 Acknowledged on: ${ackTime}`;
          }
          if (issue.resolvedAt) {
            const resolveTime = new Date(issue.resolvedAt).toLocaleDateString();
            botResponseText += `\n✨ Resolved on: ${resolveTime}`;
          }
        } else {
          botResponseText = `I couldn't find an issue with ID "${id}". Please double-check the ID and try again. You can also select from the list of available issues. 🔍`;
        }
      }
      
      const botMessage: Message = { sender: 'bot', text: botResponseText, issueDetails: issue };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
       const errorMessage: Message = { sender: 'bot', text: "I apologize, but I encountered an error while processing your request. Please try again. 🔄" };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTrackIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrackIssueById(issueId);
  };

  const handleShowAllIssues = () => {
    if (!currentUser) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Please log in to see your reported issues! 🔐" }]);
      return;
    }
    
    const issues = getIssuesByUser(currentUser.id);
    setAllIssues(issues);
    if (issues.length > 0) {
      const listMessage: Message = {
        sender: 'bot',
        text: `Here are all ${issues.length} issue(s) you've reported. Click on any issue to get its detailed status:`,
        issueList: issues.map(i => ({ id: i.id, title: i.title, status: i.status }))
      };
      setMessages(prev => [...prev, listMessage]);
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: "You haven't reported any issues yet. Report an issue first to track it here! 📝" }]);
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.Pending: return 'bg-red-500';
      case Status.InProgress: return 'bg-amber-500';
      case Status.Resolved: return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Track Your Issue</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Get real-time updates on your report using our AI assistant.</p>
        </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 h-[450px] overflow-y-auto flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && 
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                           <i className="fa-solid fa-robot text-lg text-white"></i>
                        </div>
                    }
                    <div className={`max-w-xs md:max-w-md ${msg.sender === 'user' ? '' : ''}`}>
                      <div className={`px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {/* Issue Location Map */}
                      {msg.issueDetails && (msg.issueDetails.location || msg.issueDetails.manualAddress) && (
                        <div className="mt-2">
                          <button
                            onClick={() => setSelectedIssueForMap(msg.issueDetails!)}
                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-map-location-dot text-white"></i>
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  View Issue Location
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {msg.issueDetails.manualAddress || 'Click to view on map'}
                                </p>
                              </div>
                              <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-blue-500"></i>
                            </div>
                          </button>
                        </div>
                      )}
                      {/* Issue List */}
                      {msg.issueList && msg.issueList.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.issueList.slice(0, 5).map((issue) => (
                            <button
                              key={issue.id}
                              onClick={() => handleSelectIssue(issue.id)}
                              className="w-full text-left p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                                  {issue.id.slice(-12)}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(issue.status)}`}></span>
                              </div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white mt-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {issue.title}
                              </p>
                            </button>
                          ))}
                          {msg.issueList.length > 5 && (
                            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                              +{msg.issueList.length - 5} more issues
                            </p>
                          )}
                        </div>
                      )}
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
        
        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50">
          <button
            onClick={handleShowAllIssues}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <i className="fa-solid fa-list text-xs"></i>
            Show my issues
          </button>
        </div>
        
        <form onSubmit={handleTrackIssue} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-white dark:bg-slate-800">
          <input
            type="text"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
            placeholder="Enter Issue ID or select from above..."
            className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
          />
          <button type="submit" disabled={isLoading || !issueId.trim()} className="bg-blue-600 text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-400 transition-colors shadow-sm">
             <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>

      {/* Location Map Modal */}
      {selectedIssueForMap && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedIssueForMap(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <i className="fa-solid fa-map-location-dot text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Issue Location</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {selectedIssueForMap.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssueForMap(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Map */}
            <div className="relative h-64 bg-slate-100 dark:bg-slate-900 overflow-hidden">
              {selectedIssueForMap.location ? (
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${selectedIssueForMap.location.lat}&mlon=${selectedIssueForMap.location.lng}#map=16/${selectedIssueForMap.location.lat}/${selectedIssueForMap.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                >
                  <img
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedIssueForMap.location.lng - 0.01}%2C${selectedIssueForMap.location.lat - 0.01}%2C${selectedIssueForMap.location.lng + 0.01}%2C${selectedIssueForMap.location.lat + 0.01}&layer=mapnik&marker=${selectedIssueForMap.location.lat}%2C${selectedIssueForMap.location.lng}`}
                    alt="Issue Location"
                    className="hidden"
                  />
                  {/* Static map using OSM tile server */}
                  <div className="w-full h-full relative bg-slate-200 dark:bg-slate-800">
                    <img
                      src={`https://staticmap.openstreetmap.de/staticmap.php?center=${selectedIssueForMap.location.lat},${selectedIssueForMap.location.lng}&zoom=15&size=500x256&markers=${selectedIssueForMap.location.lat},${selectedIssueForMap.location.lng},red-pushpin`}
                      alt="Issue Location Map"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to styled placeholder
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+ef4444(${selectedIssueForMap.location!.lng},${selectedIssueForMap.location!.lat})/${selectedIssueForMap.location!.lng},${selectedIssueForMap.location!.lat},14,0/500x256?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
                      }}
                    />
                    {/* Fallback overlay with location info */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/90 to-purple-600/90 opacity-0 [img[src='']~&]:opacity-100">
                      <i className="fa-solid fa-map-location-dot text-5xl text-white mb-3"></i>
                      <p className="text-white font-medium text-center px-4">
                        📍 {selectedIssueForMap.location.lat.toFixed(4)}, {selectedIssueForMap.location.lng.toFixed(4)}
                      </p>
                      <p className="text-white/70 text-sm mt-1">Click to view on OpenStreetMap</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 px-4 py-2 rounded-full shadow-lg">
                      <span className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-external-link-alt"></i>
                        View on OpenStreetMap
                      </span>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fa-solid fa-map-marker-alt text-4xl text-slate-400 mb-2"></i>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Location coordinates not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Address Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
              {selectedIssueForMap.manualAddress && (
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-location-dot text-blue-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedIssueForMap.manualAddress}
                    </p>
                    {selectedIssueForMap.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Coordinates: {selectedIssueForMap.location.lat.toFixed(6)}, {selectedIssueForMap.location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!selectedIssueForMap.manualAddress && selectedIssueForMap.location && (
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-location-dot text-blue-500 mt-0.5"></i>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Coordinates: {selectedIssueForMap.location.lat.toFixed(6)}, {selectedIssueForMap.location.lng.toFixed(6)}
                  </p>
                </div>
              )}
              
              {/* Open in OpenStreetMap button */}
              {selectedIssueForMap.location && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedIssueForMap.location.lat}&mlon=${selectedIssueForMap.location.lng}#map=16/${selectedIssueForMap.location.lat}/${selectedIssueForMap.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <i className="fa-solid fa-external-link-alt"></i>
                  Open in OpenStreetMap
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;