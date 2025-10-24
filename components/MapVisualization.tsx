import React from 'react';
import { CivicIssue } from '../types';

interface MapVisualizationProps {
  issues: CivicIssue[];
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ issues }) => {
  const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  const centerPoint = issues.length > 0
    ? { lat: issues[0].location.lat, lng: issues[0].location.lng }
    : { lat: 40.7128, lng: -74.0060 };

  const markers = issues.map(issue => 
    `markers=color:green%7C${issue.location.lat},${issue.location.lng}`
  ).join('&');

  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=${API_KEY}&center=${centerPoint.lat},${centerPoint.lng}&zoom=12&${markers}`;

  if (API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
        <div className="h-96 flex items-center justify-center bg-slate-200 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
            <div className="text-center text-slate-500 dark:text-slate-400 p-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                   <i className="fa-solid fa-map-marked-alt text-2xl"></i>
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Map Visualization Unavailable</p>
                <p className="text-sm">A valid Google Maps API key is required to display the map of resolved issues.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapSrc}
      ></iframe>
    </div>
  );
};

export default MapVisualization;