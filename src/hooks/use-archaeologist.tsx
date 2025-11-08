import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ArchaeologistService } from '@/services/archaeologists';

export const useArchaeologist = () => {
  const { user, isAuthenticated } = useAuth();
  const [isArchaeologist, setIsArchaeologist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkArchaeologistStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsArchaeologist(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const archaeologistStatus = await ArchaeologistService.isArchaeologist(user.uid);
        setIsArchaeologist(archaeologistStatus);
        setError(null);
      } catch (err) {
        console.error('Error checking archaeologist status:', err);
        setError('Failed to check archaeologist status');
        setIsArchaeologist(false);
      } finally {
        setLoading(false);
      }
    };

    checkArchaeologistStatus();
  }, [user, isAuthenticated]);

  const refreshStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const archaeologistStatus = await ArchaeologistService.isArchaeologist(user.uid);
      setIsArchaeologist(archaeologistStatus);
      setError(null);
    } catch (err) {
      console.error('Error refreshing archaeologist status:', err);
      setError('Failed to refresh archaeologist status');
    } finally {
      setLoading(false);
    }
  };

  return {
    isArchaeologist,
    loading,
    error,
    refreshStatus,
    canCreate: isAuthenticated && isArchaeologist
  };
};