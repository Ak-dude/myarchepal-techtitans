import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Sun, Droplets, Wind, Gauge } from "lucide-react";

// --- Define the props interface ---
interface SiteConditionsProps {
  latitude: number;
  longitude: number;
}

export const SiteConditions = ({ latitude, longitude }: SiteConditionsProps) => {
  // --- State for Data, Loading, and Errors ---
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Validation function for coordinates ---
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // --- Data Fetching Logic ---
  useEffect(() => {
    // Validate coordinates before making API call
    if (!isValidCoordinate(latitude, longitude)) {
      setError('Invalid coordinates provided');
      setWeather(null);
      setLoading(false);
      return;
    }

    // We build the API URL inside the effect, using the props
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index`;

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
        console.log(`API URL: ${API_URL}`);

        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Weather service error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Weather data received:', data);

        if (!data.current) {
          throw new Error('No current weather data available');
        }

        setWeather(data.current);
        setError(null);
      } catch (err: any) {
        console.error('Weather fetch error:', err);
        setError(err.message || 'Failed to load weather data');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();

    // --- This is the key change ---
    // The effect will re-run whenever 'latitude' or 'longitude' changes.
  }, [latitude, longitude]); 

  // --- Render Logic (Loading, Error states) ---
  if (loading) {
    return (
      <div className="px-4 py-6 pb-24">
        <h3 className="text-base font-semibold text-foreground mb-4">Site Conditions</h3>
        <Card className="p-4 border-border text-center text-muted-foreground">
          Loading site conditions...
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 pb-24">
        <h3 className="text-base font-semibold text-foreground mb-4">Site Conditions</h3>
        <Card className="p-4 border-border text-center text-destructive-foreground bg-destructive">
          Error loading weather: {error}
        </Card>
      </div>
    );
  }

  if (!weather) {
    return null; 
  }

  // --- Render Logic (Success state) ---
  return (
    <div className="px-4 py-6 pb-24">
      <h3 className="text-base font-semibold text-foreground mb-4">Site Conditions</h3>
      
      <Card className="p-4 border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
              <Sun className="w-7 h-7 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sunny</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {Math.round(weather.temperature_2m)}°C
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Droplets className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {weather.relative_humidity_2m}%
            </p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wind className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {Math.round(weather.wind_speed_10m)} km/h
            </p>
            <p className="text-xs text-muted-foreground">Wind</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="w-4 h-4 text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {Math.round(weather.uv_index)}
            </p>
            <p className="text-xs text-muted-foreground">UV Index</p>
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Perfect conditions for excavation work
        </p>
      </Card>
    </div>
  );
};