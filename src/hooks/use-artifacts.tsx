import { useState, useEffect } from 'react';
import { ArtifactsService, Artifact } from '@/services/artifacts';

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedArtifacts = await ArtifactsService.getAllArtifacts();
      setArtifacts(fetchedArtifacts);
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      setError('Failed to load artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, []);

  return {
    artifacts,
    loading,
    error,
    fetchArtifacts,
    refetch: fetchArtifacts
  };
};