import React from 'react';
import { CivicIssue } from '../types';

interface MapVisualizationProps {
  issues: CivicIssue[];
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ issues }) => {
  return (
    <div className="h-96 overflow-y-auto">
        {issues.length > 0 ? (
            <ul className="space-y-2">
                {issues.map(issue => (
                    <li key={issue.id}>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${issue.location.lat},${issue.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <p className="font-semibold text-slate-800 dark:text-white truncate">{issue.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <i className="fa-solid fa-map-marker-alt text-red-500"></i>
                                <span>Lat: {issue.location.lat.toFixed(4)}, Lng: {issue.location.lng.toFixed(4)}</span>
                                <span className="ml-auto text-blue-600 dark:text-blue-400 font-medium">View Map &rarr;</span>
                            </p>
                        </a>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400 p-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/50 mb-4">
                        <i className="fa-solid fa-map-marked-alt text-2xl"></i>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No Resolved Issues</p>
                    <p className="text-sm">When issues are resolved, they will appear here.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default MapVisualization;