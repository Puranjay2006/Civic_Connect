import React, { useState } from 'react';
import { User, Category, CivicIssue } from '../types';
import { ISSUE_CATEGORIES } from '../constants';
import { addIssue } from '../services/issueService';

interface IssueFormProps {
  currentUser: User;
  onIssueReported: (issue: CivicIssue) => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ currentUser, onIssueReported }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.Other);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [manualLocationError, setManualLocationError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    setShowManualLocation(false);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
        },
        (err) => {
          setError(`Error getting location: ${err.message}.`);
          setIsGettingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualLocationError(null);
    const mockGeocode: { [key: string]: { lat: number, lng: number } } = {
        "new york city": { lat: 40.7128, lng: -74.0060 },
        "london": { lat: 51.5074, lng: -0.1278 },
        "tokyo": { lat: 35.6895, lng: 139.6917 },
    };

    const foundLocation = mockGeocode[manualLocationInput.toLowerCase().trim()];
    if (foundLocation) {
        setLocation(foundLocation);
        setShowManualLocation(false);
    } else {
        setManualLocationError("Location not found. Please try a major city like 'New York City' or 'London'.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !photo || !location) {
      setError("Please fill in all fields, upload a photo, and provide your location.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newIssueData = { title, description, category, photo, location };
      const newIssue = addIssue(newIssueData, currentUser);
      onIssueReported(newIssue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Report a New Civic Issue</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Your contribution helps improve our community. Thank you for your engagement.</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields for title, description, category, photo */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Large pothole on Main Street" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Provide more details about the issue." required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 transition">
              {ISSUE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Photo</label>
            <input type="file" id="photo" accept="image/*" onChange={handleFileChange} required className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
            {photo && <img src={photo} alt="Preview" className="mt-4 rounded-lg max-h-48" />}
          </div>
          
          {/* Location Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={handleGetLocation} disabled={isGettingLocation} className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                  {isGettingLocation ? <><i className="fa-solid fa-spinner animate-spin"></i> Getting Location...</> : <><i className="fa-solid fa-location-crosshairs"></i> Get Current Location</>}
                </button>
                <button type="button" onClick={() => setShowManualLocation(!showManualLocation)} className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500">
                  <i className="fa-solid fa-keyboard"></i> Enter Manually
                </button>
              </div>
              
              {location && (
                 <div className="text-center bg-green-100 dark:bg-green-900/50 p-2 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        <i className="fa-solid fa-check-circle mr-2"></i>Location captured: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
                    </p>
                </div>
              )}
              
              {showManualLocation && (
                  <form onSubmit={handleManualLocationSubmit} className="space-y-3 form-fade-in pt-4 border-t border-slate-200 dark:border-slate-600">
                      <label htmlFor="manual-location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter your full address</label>
                      <div className="flex gap-2">
                        <input id="manual-location" type="text" value={manualLocationInput} onChange={(e) => setManualLocationInput(e.target.value)} className="flex-grow px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700">Save</button>
                      </div>
                      {manualLocationError && <p className="text-xs text-red-500">{manualLocationError}</p>}
                  </form>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading || !location}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Submitting...</> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;