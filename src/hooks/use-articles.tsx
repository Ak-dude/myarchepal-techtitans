import { useState, useEffect } from 'react';
import { ArticlesService, Article } from '@/services/articles';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ArticlesService.getAllArticles();
        setArticles(data);
      } catch (error: any) {
        console.error('Error fetching articles:', error);
        setError(error.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
};

export const useFeaturedArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ArticlesService.getFeaturedArticles();
        setArticles(data);
      } catch (error: any) {
        console.error('Error fetching featured articles:', error);
        setError(error.message || 'Failed to load featured articles');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  return { articles, loading, error };
};

export const useArticlesByCategory = (category: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticlesByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ArticlesService.getArticlesByCategory(category);
        setArticles(data);
      } catch (error: any) {
        console.error('Error fetching articles by category:', error);
        setError(error.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    if (category && category !== 'All') {
      fetchArticlesByCategory();
    }
  }, [category]);

  return { articles, loading, error };
};

export const useArticleSearch = (searchTerm: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchArticles = async () => {
      if (!searchTerm.trim()) {
        setArticles([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ArticlesService.searchArticles(searchTerm);
        setArticles(data);
      } catch (error: any) {
        console.error('Error searching articles:', error);
        setError(error.message || 'Failed to search articles');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchArticles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return { articles, loading, error };
};