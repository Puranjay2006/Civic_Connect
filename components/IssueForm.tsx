import React, { useState, useEffect } from 'react';
import { User, Category, CivicIssue, Department } from '../types';
import { ISSUE_CATEGORIES, DEPARTMENTS } from '../constants';
import { addIssue } from '../services/issueService';
import CustomSelect from './CustomSelect';
import LocationPicker from './LocationPicker';
import { suggestDepartmentAndCategory, AISuggestion } from '../services/geminiService';

interface IssueFormProps {
  currentUser: User;
  onIssueReported: (issue: CivicIssue) => void;
}

// Debounce helper function to delay API calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// Indian address fields interface
interface IndianAddress {
  houseNumber: string;
  streetRoad: string;
  areaLocality: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
];

const IssueForm: React.FC<IssueFormProps> = ({ currentUser, onIssueReported }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.Other);
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Indian-style address fields
  const [address, setAddress] = useState<IndianAddress>({
    houseNumber: '',
    streetRoad: '',
    areaLocality: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  // State for AI department suggestion
  const [isSuggestingDept, setIsSuggestingDept] = useState(false);
  const [suggestedDept, setSuggestedDept] = useState<Department | 'unknown' | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<Category | 'unknown' | null>(null);
  const [isManualDeptSelection, setIsManualDeptSelection] = useState(false);
  const [isManualCategorySelection, setIsManualCategorySelection] = useState(false);

  // Debounce user input to avoid excessive API calls
  const debouncedTitle = useDebounce(title, 700);
  const debouncedDescription = useDebounce(description, 700);

  // Effect to trigger AI suggestion for BOTH department and category
  useEffect(() => {
    const getSuggestion = async () => {
      // Only run if user has not manually overridden and there's enough content
      if (!isManualDeptSelection && (debouncedTitle.length > 5 || debouncedDescription.length > 10)) {
        setIsSuggestingDept(true);
        setSuggestedDept(null);
        setSuggestedCategory(null);
        try {
          const suggestion: AISuggestion = await suggestDepartmentAndCategory(debouncedTitle, debouncedDescription);
          
          // Set department suggestion
          setSuggestedDept(suggestion.department);
          if (suggestion.department !== 'unknown') {
            setDepartment(suggestion.department);
          } else {
            setIsManualDeptSelection(true);
          }
          
          // Set category suggestion
          setSuggestedCategory(suggestion.category);
          if (suggestion.category !== 'unknown' && !isManualCategorySelection) {
            setCategory(suggestion.category);
          }
        } catch (error) {
          console.error("AI suggestion failed", error);
          setSuggestedDept('unknown');
          setSuggestedCategory('unknown');
          setIsManualDeptSelection(true);
        } finally {
          setIsSuggestingDept(false);
        }
      }
    };

    getSuggestion();
  }, [debouncedTitle, debouncedDescription, isManualDeptSelection, isManualCategorySelection]);

  const handleManualDeptOverride = () => {
    setIsManualDeptSelection(true);
    setSuggestedDept(null);
  };

  const handleManualCategoryOverride = () => {
    setIsManualCategorySelection(true);
    setSuggestedCategory(null);
  };

  const handleLocationChange = (newLocation: { lat: number; lng: number }) => {
    // Ignore if lat/lng are 0 (clear signal)
    if (newLocation.lat === 0 && newLocation.lng === 0) {
      setLocation(null);
    } else {
      setLocation(newLocation);
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

  // Geocode address using Google Maps API
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const GOOGLE_MAPS_API_KEY = 'AIzaSyCy04Z9p60Selw2tO7lhRQG86va8xKmYP0';
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Build full address string from fields
  const buildFullAddress = (): string => {
    const parts = [
      address.houseNumber,
      address.streetRoad,
      address.areaLocality,
      address.landmark ? `Near ${address.landmark}` : '',
      address.city,
      address.state,
      address.pincode ? `PIN: ${address.pincode}` : ''
    ].filter(part => part.trim());
    return parts.join(', ');
  };

  // Check if address is valid (at least area/locality and city are required)
  const isAddressValid = (): boolean => {
    return address.areaLocality.trim().length > 0 && address.city.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasLocation = useManualAddress ? isAddressValid() : location !== null;
    if (!title || !description || !category || !hasLocation || !department) {
      setError("Please fill in all required fields: title, description, and location (Area/Locality and City are required).");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let finalLocation = location;
      const fullAddress = buildFullAddress();
      
      // If using manual address, try to geocode it
      if (useManualAddress && fullAddress) {
        const geocodedLocation = await geocodeAddress(fullAddress);
        if (geocodedLocation) {
          finalLocation = geocodedLocation;
        } else if (!finalLocation) {
          // Default to center of India if geocoding fails and no location set
          finalLocation = { lat: 20.5937, lng: 78.9629 };
        }
      }
      
      const newIssueData = { 
        title, 
        description, 
        category, 
        photo: photo || '', 
        location: finalLocation, 
        manualAddress: useManualAddress ? fullAddress : undefined,
        department 
      };
      const { newIssue } = addIssue(newIssueData, currentUser);
      onIssueReported(newIssue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 mb-4">
          <i className="fa-solid fa-plus text-blue-500"></i>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">New Report</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Report an Issue</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Help us improve your community. Your report will be reviewed and assigned to the appropriate department.</p>
      </div>
      <div className="premium-card p-8 md:p-10 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields for title, description, category, photo */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <i className="fa-solid fa-heading mr-2 text-blue-500"></i>
              Issue Title
            </label>
            <input 
              type="text" 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Large pothole on Main Street" 
              required 
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400" 
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <i className="fa-solid fa-align-left mr-2 text-blue-500"></i>
              Description
            </label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4} 
              placeholder="Provide more details about the issue. Be as specific as possible to help us resolve it faster." 
              required 
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 resize-none" 
            />
          </div>
          
          {/* Category and Department in grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <i className="fa-solid fa-tag mr-2 text-purple-500"></i>
                Category
              </label>
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/30 min-h-[76px] flex flex-col justify-center">
                {isSuggestingDept ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i>
                    <span>AI analyzing...</span>
                  </div>
                ) : isManualCategorySelection ? (
                  <CustomSelect
                    id="category"
                    value={category}
                    onChange={(value) => setCategory(value as Category)}
                    options={ISSUE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                  />
                ) : suggestedCategory && suggestedCategory !== 'unknown' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{suggestedCategory}</span>
                      <span className="text-xs px-2 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-sm">
                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>AI
                      </span>
                    </div>
                    <button type="button" onClick={handleManualCategoryOverride} className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Change
                    </button>
                  </div>
                ) : (
                  <CustomSelect
                    id="category"
                    value={category}
                    onChange={(value) => { setCategory(value as Category); setIsManualCategorySelection(true); }}
                    options={ISSUE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                  />
                )}
              </div>
            </div>
            
            {/* Department Section */}
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <i className="fa-solid fa-building mr-2 text-indigo-500"></i>
                Department
              </label>
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/30 min-h-[76px] flex flex-col justify-center">
                {isSuggestingDept ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i>
                    <span>Finding department...</span>
                  </div>
                ) : isManualDeptSelection ? (
                  <>
                    {suggestedDept === 'unknown' && (
                       <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <i className="fa-solid fa-info-circle mr-1"></i>
                          Please select a department
                       </p>
                    )}
                    <CustomSelect
                      id="department"
                      value={department}
                      onChange={(value) => setDepartment(value as Department)}
                      options={DEPARTMENTS.map(dep => ({ value: dep, label: dep }))}
                    />
                  </>
                ) : suggestedDept ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{suggestedDept}</span>
                        <span className="text-xs px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-sm">
                            <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>AI
                        </span>
                    </div>
                    <button type="button" onClick={handleManualDeptOverride} className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Change
                    </button>
                  </div>
                ) : (
                   <p className="text-sm text-slate-500 dark:text-slate-400">
                      <i className="fa-solid fa-lightbulb mr-1 text-yellow-500"></i>
                      Type above to get AI suggestions
                   </p>
                )}
              </div>
            </div>
          </div>

          {/* SLA Information */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <i className="fa-solid fa-clock text-white"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Target Resolution: 3 Hours</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">SLA (Service Level Agreement) for demo purposes</p>
              </div>
            </div>
          </div>

          {/* AI Auto-Assignment Notice */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">AI-Powered Assignment</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Category and department will be automatically assigned based on your description</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <i className="fa-solid fa-camera mr-2 text-green-500"></i>
              Upload Photo <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input 
                type="file" 
                id="photo" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white file:shadow-lg file:shadow-blue-500/25 hover:file:shadow-blue-500/40 file:transition-all file:duration-200 file:cursor-pointer" 
              />
            </div>
            {photo && (
              <div className="mt-4 relative group">
                <img src={photo} alt="Preview" className="rounded-xl max-h-48 shadow-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Photo attached</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Location Section with Manual Address Option */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <i className="fa-solid fa-map-location-dot mr-2 text-red-500"></i>
              Issue Location
            </label>
            
            {/* Toggle between Map and Manual Address */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUseManualAddress(false)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  !useManualAddress
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <i className="fa-solid fa-map mr-2"></i>Use Map
              </button>
              <button
                type="button"
                onClick={() => setUseManualAddress(true)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  useManualAddress
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <i className="fa-solid fa-keyboard mr-2"></i>Enter Address
              </button>
            </div>

            {useManualAddress ? (
              <div className="space-y-4">
                {/* Row 1: House Number and Street */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      House/Building No.
                    </label>
                    <input
                      type="text"
                      value={address.houseNumber}
                      onChange={(e) => setAddress({...address, houseNumber: e.target.value})}
                      placeholder="e.g., 12-A, B-204"
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Street/Road Name
                    </label>
                    <input
                      type="text"
                      value={address.streetRoad}
                      onChange={(e) => setAddress({...address, streetRoad: e.target.value})}
                      placeholder="e.g., MG Road, Gandhi Nagar"
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                {/* Row 2: Area/Locality and Landmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Area/Locality/Sector <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.areaLocality}
                      onChange={(e) => setAddress({...address, areaLocality: e.target.value})}
                      placeholder="e.g., Sector 21, Koramangala"
                      required
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({...address, landmark: e.target.value})}
                      placeholder="e.g., Near Big Bazaar, Opp. SBI Bank"
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                {/* Row 3: City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      City/Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      placeholder="e.g., Mumbai, Delhi"
                      required
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      State
                    </label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white text-sm"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setAddress({...address, pincode: val});
                      }}
                      placeholder="e.g., 400001"
                      maxLength={6}
                      className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700/50 dark:focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-white placeholder-slate-400 text-sm"
                    />
                  </div>
                </div>

                {/* Address Preview */}
                {isAddressValid() && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-400 flex items-start gap-2">
                      <i className="fa-solid fa-check-circle mt-0.5"></i>
                      <span><strong>Address:</strong> {buildFullAddress()}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                  <LocationPicker
                    value={location}
                    onChange={handleLocationChange}
                    height="280px"
                  />
                </div>
                {location && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <i className="fa-solid fa-check-circle"></i>
                    Location selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || (!useManualAddress && !location) || (useManualAddress && !isAddressValid())}
            className="group w-full flex justify-center items-center gap-3 py-4 px-6 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                Submitting...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;