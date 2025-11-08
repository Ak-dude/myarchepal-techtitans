import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Sun, Droplets, Wind, Gauge, MapPin } from "lucide-react";

// --- Define the props interface ---
interface SiteConditionsProps {
  latitude: number;
  longitude: number;
}

export const SiteConditions = ({ latitude, longitude }: SiteConditionsProps) => {
  // --- State for Data, Loading, and Errors ---
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState<string>('');
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
    console.log('🌤️ SiteConditions: Component mounted/updated');
    console.log('🌤️ Coordinates received:', { latitude, longitude });

    // Validate coordinates before making API call
    if (!isValidCoordinate(latitude, longitude)) {
      console.error('❌ Invalid coordinates provided:', { latitude, longitude });
      setError('Invalid coordinates provided');
      setWeather(null);
      setLoading(false);
      return;
    }

    // We build the API URL inside the effect, using the props
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index`;

    const fetchWeatherAndLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🌤️ Fetching weather data for coordinates: ${latitude}, ${longitude}`);
        console.log(`🌤️ API URL: ${API_URL}`);

        // Fetch weather data
        const weatherResponse = await fetch(API_URL);

        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          console.error(`❌ API Error (${weatherResponse.status}): ${errorText}`);
          throw new Error(`Weather service error: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }

        const weatherData = await weatherResponse.json();
        console.log('✅ Weather data received:', weatherData);

        if (!weatherData.current) {
          console.error('❌ No current weather data in response:', weatherData);
          throw new Error('No current weather data available');
        }

        console.log('✅ Setting weather state with data:', weatherData.current);
        setWeather(weatherData.current);

        // Fetch location name using reverse geocoding
        console.log(`📍 Fetching location name for coordinates: ${latitude}, ${longitude}`);
        const geocodeURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

        try {
          const geoResponse = await fetch(geocodeURL, {
            headers: {
              'User-Agent': 'ArchePal Archaeological App' // Required by Nominatim
            }
          });

          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            console.log('✅ Location data received:', geoData);

            // Extract location name (city, town, or county)
            const address = geoData.address || {};
            const location = address.city || address.town || address.village || address.county || address.state || 'Unknown Location';
            setLocationName(location);
            console.log('✅ Location name set to:', location);
          } else {
            console.warn('⚠️ Geocoding API failed, using default location name');
            setLocationName('Site Location');
          }
        } catch (geoError) {
          console.warn('⚠️ Error fetching location name:', geoError);
          setLocationName('Site Location');
        }

        setError(null);
      } catch (err: any) {
        console.error('❌ Weather fetch error:', err);
        setError(err.message || 'Failed to load weather data');
        setWeather(null);
        setLocationName('');
      } finally {
        setLoading(false);
        console.log('🌤️ Weather fetch completed');
      }
    };

    fetchWeatherAndLocation();

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
        <Card className="p-4 border-border text-center">
          <p className="text-destructive mb-2">⚠️ Error loading weather</p>
          <p className="text-xs text-muted-foreground mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-primary underline hover:no-underline"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!weather) {
    console.log('⚠️ Weather state is null, component will not render');
    return null;
  }

  console.log('✅ Rendering weather UI with data:', weather);

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
              {locationName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {locationName}
                </p>
              )}
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