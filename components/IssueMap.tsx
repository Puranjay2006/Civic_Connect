import React, { useEffect, useRef, useState } from 'react';
import { CivicIssue, Status, Department } from '../types';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface IssueMapProps {
  issues: CivicIssue[];
  onIssueSelect?: (issue: CivicIssue) => void;
  singleIssue?: CivicIssue;
  height?: string;
  showFilters?: boolean;
  defaultCenter?: { lat: number; lng: number };
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCy04Z9p60Selw2tO7lhRQG86va8xKmYP0';

// Status colors for markers
const statusColors: Record<Status, string> = {
  [Status.Pending]: '#EF4444', // red
  [Status.InProgress]: '#F59E0B', // yellow/orange
  [Status.Resolved]: '#22C55E', // green
};

// Department icons
const departmentIcons: Record<Department, string> = {
  [Department.Electrical]: '⚡',
  [Department.Water]: '💧',
  [Department.Medical]: '🏥',
  [Department.Sanitation]: '🗑️',
  [Department.Roads]: '🛣️',
};

const IssueMap: React.FC<IssueMapProps> = ({
  issues,
  onIssueSelect,
  singleIssue,
  height = '400px',
  showFilters = false,
  defaultCenter = { lat: 20.5937, lng: 78.9629 }, // Default to India center
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setLoadError('Failed to load Google Maps. Using fallback view.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const displayIssues = singleIssue ? [singleIssue] : issues;
    
    // Calculate center based on issues
    let center = defaultCenter;
    if (displayIssues.length > 0) {
      const validIssues = displayIssues.filter(i => i.location?.lat && i.location?.lng);
      if (validIssues.length > 0) {
        const avgLat = validIssues.reduce((sum, i) => sum + i.location.lat, 0) / validIssues.length;
        const avgLng = validIssues.reduce((sum, i) => sum + i.location.lng, 0) / validIssues.length;
        center = { lat: avgLat, lng: avgLng };
      }
    }

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: singleIssue ? 15 : 12,
      mapId: 'civic_connect_map',
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'simplified' }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }, [isLoaded, defaultCenter, singleIssue]);

  // Update markers when issues or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    const displayIssues = singleIssue ? [singleIssue] : issues;
    
    // Filter issues
    const filteredIssues = displayIssues.filter(issue => {
      // Must have valid location (not null, not 0,0)
      if (!issue.location || (issue.location.lat === 0 && issue.location.lng === 0)) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (departmentFilter !== 'all' && issue.department !== departmentFilter) return false;
      return true;
    });

    // Create markers
    filteredIssues.forEach(issue => {
      const markerColor = statusColors[issue.status];
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div style="
          background: ${markerColor};
          padding: 8px 12px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transform: translateY(-50%);
          border: 3px solid white;
        ">
          <span>${departmentIcons[issue.department] || '📍'}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${markerColor};
          margin: -2px auto 0;
        "></div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: issue.location.lat, lng: issue.location.lng },
        content: markerElement,
        title: issue.title,
      });

      // Add click listener
      marker.addListener('click', () => {
        const locationText = issue.manualAddress 
          ? `📍 ${issue.manualAddress}` 
          : `📍 ${issue.location.lat.toFixed(4)}, ${issue.location.lng.toFixed(4)}`;
        
        const infoContent = `
          <div style="max-width: 280px; padding: 8px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #1e293b;">
              ${issue.title}
            </h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
              <span style="
                background: ${markerColor};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
              ">${issue.status}</span>
              <span style="
                background: #e2e8f0;
                color: #475569;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
              ">${issue.department}</span>
              <span style="
                background: #e2e8f0;
                color: #475569;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
              ">${issue.category}</span>
            </div>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; line-height: 1.4;">
              ${issue.description.substring(0, 100)}${issue.description.length > 100 ? '...' : ''}
            </p>
            <p style="margin: 0 0 8px; color: #3b82f6; font-size: 12px; line-height: 1.4;">
              ${locationText}
            </p>
            ${issue.photo ? `
              <img src="${issue.photo}" alt="${issue.title}" style="
                width: 100%;
                height: 100px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 8px;
              " />
            ` : ''}
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
              📅 Reported: ${new Date(issue.createdAt).toLocaleDateString()}
            </p>
          </div>
        `;

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }

        if (onIssueSelect) {
          onIssueSelect(issue);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple markers
    if (filteredIssues.length > 1 && mapInstanceRef.current) {
      const bounds = new google.maps.LatLngBounds();
      filteredIssues.forEach(issue => {
        bounds.extend({ lat: issue.location.lat, lng: issue.location.lng });
      });
      mapInstanceRef.current.fitBounds(bounds, 50);
    }
  }, [issues, isLoaded, statusFilter, departmentFilter, singleIssue, onIssueSelect]);

  if (loadError) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-8 text-center" style={{ height }}>
        <i className="fa-solid fa-map-location-dot text-4xl text-slate-400 mb-4"></i>
        <p className="text-slate-600 dark:text-slate-400">{loadError}</p>
        <div className="mt-4 text-sm text-slate-500">
          {issues.length > 0 && (
            <p>Showing {issues.length} issue(s) on list view</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="issue-map-container">
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              {Object.values(Status).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as Department | 'all')}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Departments</option>
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700"
        style={{ height, width: '100%' }}
      >
        {!isLoaded && (
          <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {!singleIssue && issues.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <i className="fa-solid fa-map-pin mr-1"></i>
            Showing {issues.filter(i => {
              if (!i.location?.lat || !i.location?.lng) return false;
              if (statusFilter !== 'all' && i.status !== statusFilter) return false;
              if (departmentFilter !== 'all' && i.department !== departmentFilter) return false;
              return true;
            }).length} of {issues.length} issues on map
          </p>
        </div>
      )}
    </div>
  );
};

export default IssueMap;
