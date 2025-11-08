import { useState, useEffect } from 'react';
import { Site, SitesService } from '@/services/sites';
import { useAuth } from '@/hooks/use-auth';

export const useSites = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    initializeAndFetchSites();
  }, [isAuthenticated]); // Re-run when authentication state changes

  const initializeAndFetchSites = async () => {
    try {
      setLoading(true);

      // First, always try to fetch existing sites (works for both authenticated and unauthenticated users)
      const data = await SitesService.getAllSites();

      // Only initialize default sites if user is authenticated and sites are empty
      if (isAuthenticated && !initialized && data.length === 0) {
        try {
          console.log('🏛️ User is authenticated, initializing default NC archaeological sites...');
          await SitesService.initializeDefaultNCSites();
          setInitialized(true);
          // Fetch sites again after initialization
          const updatedData = await SitesService.getAllSites();
          setSites(updatedData);
        } catch (initError: any) {
          console.error('Error initializing default sites:', initError);
          // Don't fail the entire operation if initialization fails
          // Still show existing sites if any
          setSites(data);
        }
      } else {
        setSites(data);
        if (!isAuthenticated) {
          console.log('👤 User not authenticated - showing existing sites only');
        } else if (data.length > 0) {
          console.log('✅ Sites already exist - skipping initialization');
        }
      }

      setError(null);
    } catch (err: any) {
      setError('Failed to fetch sites');
      console.error('Error in initializeAndFetchSites:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoading(true);
      const data = await SitesService.getAllSites();
      setSites(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSite = async (siteData: Omit<Site, 'id'>) => {
    try {
      const siteId = await SitesService.createSite(siteData);
      await fetchSites(); // Refresh the list
      return siteId;
    } catch (err) {
      setError('Failed to create site');
      throw err;
    }
  };

  const updateSite = async (siteId: string, updates: Partial<Site>) => {
    try {
      await SitesService.updateSite(siteId, updates);
      await fetchSites(); // Refresh the list
    } catch (err) {
      setError('Failed to update site');
      throw err;
    }
  };

  const deleteSite = async (siteId: string) => {
    try {
      await SitesService.deleteSite(siteId);
      await fetchSites(); // Refresh the list
    } catch (err) {
      setError('Failed to delete site');
      throw err;
    }
  };

  // Manual function to initialize default sites (for authenticated users)
  const initializeDefaultSites = async () => {
    if (!isAuthenticated) {
      throw new Error('You must be signed in to initialize default sites');
    }

    try {
      setLoading(true);
      await SitesService.initializeDefaultNCSites();
      setInitialized(true);
      await fetchSites(); // Refresh the sites list
    } catch (err) {
      setError('Failed to initialize default sites');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sites,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    initializeDefaultSites
  };
};