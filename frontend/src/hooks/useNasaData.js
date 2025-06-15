// hooks/useNASA.js - Updated with AI integration
import { useState, useEffect, useCallback } from 'react';
import { nasaAPI } from '../services/api';
import { aiService } from '../services/aiApi';

export const useAPOD = (date = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const fetchAPOD = useCallback(async (selectedDate = date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await nasaAPI.getAPOD(selectedDate);
      const apodData = response.data.data;
      setData(apodData);
      
      // AI analysis is now included in the backend response
      if (apodData.aiAnalysis) {
        setAiAnalysis(apodData.aiAnalysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch APOD');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAPOD();
  }, [fetchAPOD]);

  const getRandomAPOD = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await nasaAPI.getRandomAPOD();
      const apodData = response.data.data;
      setData(apodData);
      
      if (apodData.aiAnalysis) {
        setAiAnalysis(apodData.aiAnalysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch random APOD');
    } finally {
      setLoading(false);
    }
  };

  // Manual AI analysis trigger (if needed)
  const analyzeWithAI = async () => {
    if (!data) return;
    
    setLoading(true);
    try {
      const response = await aiService.analyzeData({
        imageUrl: data.url,
        text: data.explanation,
        topic: data.title
      });
      setAiAnalysis(response.data.data);
    } catch (err) {
      console.error('AI analysis failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    aiAnalysis,
    refetch: fetchAPOD, 
    getRandomAPOD,
    analyzeWithAI
  };
};

export const useMarsPhotos = (rover = 'curiosity', sol = 1000) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const fetchPhotos = useCallback(async (selectedRover = rover, selectedSol = sol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await nasaAPI.getMarsPhotos(selectedRover, selectedSol);
      const marsData = response.data.data;
      setData(marsData.photos || []);
      
      // AI analysis is now included in the backend response
      if (marsData.aiAnalysis) {
        setAiAnalysis(marsData.aiAnalysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch Mars photos');
    } finally {
      setLoading(false);
    }
  }, [rover, sol]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Analyze specific photo with AI
  const analyzePhoto = async (photoUrl) => {
    setLoading(true);
    try {
      const response = await aiService.analyzeImage(photoUrl);
      return response.data.data;
    } catch (err) {
      console.error('Photo analysis failed:', err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    aiAnalysis,
    refetch: fetchPhotos,
    analyzePhoto
  };
};

export const useNearEarthObjects = (startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const fetchNEOs = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await nasaAPI.getNearEarthObjects(startDate, endDate);
      const neoData = response.data.data;
      setData(neoData);
      
      // AI analysis is now included in the backend response
      if (neoData.aiAnalysis) {
        setAiAnalysis(neoData.aiAnalysis);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch NEO data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchNEOs();
  }, [fetchNEOs]);

  return { 
    data, 
    loading, 
    error, 
    aiAnalysis,
    refetch: fetchNEOs 
  };
};

// New hook for NASA library search with AI
export const useNASASearch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const search = async (query, mediaType = 'image') => {
    if (!query.trim()) {
      setError('Search query is required');
      return;
    }

    setLoading(true);
    setError(null);
    setAiAnalysis(null);
    
    try {
      const response = await nasaAPI.searchLibrary(query, mediaType);
      const searchData = response.data.data;
      setData(searchData);
      
      // AI analysis is now included in the backend response
      if (searchData.aiAnalysis) {
        setAiAnalysis(searchData.aiAnalysis);
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setData(null);
    setError(null);
    setAiAnalysis(null);
  };

  return {
    data,
    loading,
    error,
    aiAnalysis,
    search,
    clearSearch
  };
};

// New hook for AI services
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Check AI service status
  const checkStatus = useCallback(async () => {
    try {
      const response = await aiService.getStatus();
      setStatus(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Failed to check AI status:', err.message);
      setStatus({ available: false, message: 'AI service unavailable' });
      return null;
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Analyze any data with AI
  const analyze = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.analyzeData(data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.message || 'AI analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Analyze image only
  const analyzeImage = async (imageUrl) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.analyzeImage(imageUrl);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.message || 'Image analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Analyze text only
  const analyzeText = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const response = await aiService.analyzeText(text);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.message || 'Text analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get astronomy tips
  const getTips = async (topic) => {
    try {
      const response = await aiService.getTips(topic);
      return response.data.data;
    } catch (err) {
      console.error('Failed to get tips:', err.message);
      return null;
    }
  };

  return {
    loading,
    error,
    status,
    analyze,
    analyzeImage,
    analyzeText,
    getTips,
    checkStatus
  };
};

// Hook for managing AI analysis state across components
export const useAIAnalysis = () => {
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState({});

  const addAnalysis = (key, analysis) => {
    setAnalyses(prev => ({
      ...prev,
      [key]: analysis
    }));
  };

  const setLoadingState = (key, isLoading) => {
    setLoading(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const getAnalysis = (key) => analyses[key];
  const isLoading = (key) => loading[key] || false;

  const clearAnalysis = (key) => {
    setAnalyses(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    setLoading(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const clearAll = () => {
    setAnalyses({});
    setLoading({});
  };

  return {
    analyses,
    loading,
    addAnalysis,
    setLoadingState,
    getAnalysis,
    isLoading,
    clearAnalysis,
    clearAll
  };
};