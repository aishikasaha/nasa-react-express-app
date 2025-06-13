import { useState, useEffect, useCallback } from 'react';
import { nasaAPI } from '../services/api';

export const useAPOD = (date = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAPOD = useCallback(async (selectedDate = date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await nasaAPI.getAPOD(selectedDate);
      setData(response.data.data);
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
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch random APOD');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAPOD, getRandomAPOD };
};

export const useMarsPhotos = (rover = 'curiosity', sol = 1000) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotos = useCallback(async (selectedRover = rover, selectedSol = sol) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await nasaAPI.getMarsPhotos(selectedRover, selectedSol);
      setData(response.data.data.photos || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch Mars photos');
    } finally {
      setLoading(false);
    }
  }, [rover, sol]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return { data, loading, error, refetch: fetchPhotos };
};

export const useNearEarthObjects = (startDate, endDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNEOs = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await nasaAPI.getNearEarthObjects(startDate, endDate);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch NEO data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchNEOs();
  }, [fetchNEOs]);

  return { data, loading, error, refetch: fetchNEOs };
};
