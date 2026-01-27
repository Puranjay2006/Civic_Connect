import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
  height?: string;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCy04Z9p60Selw2tO7lhRQG86va8xKmYP0';

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  height = '300px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  // Default center (India)
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);
  }, []);

  const updateMarkerPosition = useCallback((position: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          background: #EF4444;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          border: 3px solid white;
        ">
          <i class="fa-solid fa-location-dot" style="
            color: white;
            font-size: 16px;
            transform: rotate(45deg);
          "></i>
        </div>
        <div style="
          width: 8px;
          height: 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          margin-top: 4px;
        "></div>
      </div>
    `;

    markerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstanceRef.current,
      position,
      content: markerElement,
      gmpDraggable: true,
    });

    // Handle marker drag
    markerRef.current.addListener('dragend', () => {
      const newPos = markerRef.current?.position;
      if (newPos) {
        const lat = typeof newPos.lat === 'function' ? newPos.lat() : newPos.lat;
        const lng = typeof newPos.lng === 'function' ? newPos.lng() : newPos.lng;
        onChange({ lat, lng });
        reverseGeocode({ lat, lng });
      }
    });

    mapInstanceRef.current.panTo(position);
  }, [isLoaded, onChange]);

  const reverseGeocode = async (position: { lat: number; lng: number }) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: position });
      if (response.results[0]) {
        setAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const initialCenter = value || defaultCenter;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: value ? 15 : 5,
      mapId: 'civic_connect_picker',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Add click listener to place marker
    mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        onChange(position);
        updateMarkerPosition(position);
        reverseGeocode(position);
      }
    });

    // If there's an initial value, show the marker
    if (value) {
      updateMarkerPosition(value);
      reverseGeocode(value);
    }
  }, [isLoaded, value, onChange, updateMarkerPosition, defaultCenter]);

  // Update marker when value changes externally
  useEffect(() => {
    if (value && mapInstanceRef.current && isLoaded) {
      updateMarkerPosition(value);
    }
  }, [value, isLoaded, updateMarkerPosition]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onChange(location);
        updateMarkerPosition(location);
        reverseGeocode(location);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(16);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="location-picker">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Getting location...
            </>
          ) : (
            <>
              <i className="fa-solid fa-location-crosshairs"></i>
              Use My Current Location
            </>
          )}
        </button>
        
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="text-sm">or click on the map</span>
        </div>
      </div>

      {locationError && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          {locationError}
        </div>
      )}

      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700"
        style={{ height, width: '100%' }}
      >
        {!isLoaded && (
          <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <i className="fa-solid fa-map-pin text-red-500"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected Location
              </p>
              {address && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
                  {address}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange({ lat: 0, lng: 0 }); // Will need to handle this as "no location"
                setAddress('');
                if (markerRef.current) {
                  markerRef.current.map = null;
                  markerRef.current = null;
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear location"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        <i className="fa-solid fa-info-circle mr-1"></i>
        Drag the marker to adjust the exact location of the issue
      </p>
    </div>
  );
};

export default LocationPicker;
