import React from 'react';

interface SimulatedEmailProps {
  recipient: string;
  subject: string;
  body: string;
  cta?: { text: string; link: string; };
  onCtaClick?: (link: string) => void;
}

const SimulatedEmail: React.FC<SimulatedEmailProps> = ({ recipient, subject, body, cta, onCtaClick }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-700">
        <span className="font-semibold">From:</span>
        <span>Civic Connect &lt;no-reply@civicconnect.app&gt;</span>
        <span className="font-semibold">To:</span>
        <span>{recipient}</span>
        <span className="font-semibold">Subject:</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{subject}</span>
      </div>
      <div className="py-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
        {body}
      </div>
      {cta && onCtaClick && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            onClick={() => onCtaClick(cta.link)}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {cta.text}
          </button>
        </div>
      )}
    </div>
  );
};

export default SimulatedEmail;
