import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Article interface matching Firestore document structure
export interface Article {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  image?: string; // URL to cover image
  imageEmoji?: string; // Fallback emoji
  aiSummary?: string; // AI-generated analysis of the cover image
  author: string; // Author name
  authorId: string; // UID of archaeologist who created it
  authorAvatar?: string; // Author avatar URL
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  published: boolean;
  readTime?: string; // e.g., "8 min read"
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  publishedAt?: Date | Timestamp;
}

// Create a reference to the Articles collection
const articlesCollection: CollectionReference<DocumentData> | undefined = db
  ? collection(db, 'Articles')
  : undefined;

export class ArticlesService {
  // Get all published articles
  static async getAllArticles(): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      const q = query(
        articlesCollection,
        orderBy('publishedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      // Filter for published articles in the app
      const articles = allArticles.filter(article => article.published === true);
      return articles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  // Get articles by category
  static async getArticlesByCategory(category: string): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      const q = query(
        articlesCollection,
        orderBy('publishedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      // Filter for published articles in the specific category
      const categoryArticles = allArticles
        .filter(article => article.published === true && article.category === category);

      return categoryArticles;
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  }

  // Get featured articles
  static async getFeaturedArticles(): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      const q = query(
        articlesCollection,
        orderBy('publishedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      // Filter for published and featured articles in the app, then limit to 5
      const featuredArticles = allArticles
        .filter(article => article.published === true && article.featured === true)
        .slice(0, 5);

      return featuredArticles;
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      return [];
    }
  }

  // Get article by ID
  static async getArticleById(id: string): Promise<Article | null> {
    try {
      if (!db) {
        console.warn('Firebase is not properly initialized');
        return null;
      }

      const articleDoc = doc(db, 'Articles', id);
      const docSnap = await getDoc(articleDoc);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Article;
      } else {
        console.log('No such article found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      throw error;
    }
  }

  // Create a new article
  static async createArticle(articleData: Omit<Article, 'id'>): Promise<string> {
    try {
      if (!articlesCollection) {
        throw new Error('Firebase is not properly initialized');
      }

      // Calculate estimated read time (simple: ~200 words per minute)
      const wordCount = articleData.content.split(/\s+/).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTime = `${readTimeMinutes} min read`;

      const articleWithDefaults = {
        ...articleData,
        views: 0,
        likes: 0,
        comments: 0,
        featured: false,
        readTime,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: Timestamp.now()
      };

      const docRef = await addDoc(articlesCollection, articleWithDefaults);
      console.log('Article created with ID: ', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating article:', error);

      // Check for specific Firebase errors
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are signed in and Firestore security rules allow this operation.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is currently unavailable. Please try again later.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be authenticated to create articles. Please sign in again.');
      } else {
        throw new Error(`Failed to create article: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Update an existing article
  static async updateArticle(articleId: string, updates: Partial<Article>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }

      const articleDoc = doc(db, 'Articles', articleId);

      // Recalculate read time if content is being updated
      if (updates.content) {
        const wordCount = updates.content.split(/\s+/).length;
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
        updates.readTime = `${readTimeMinutes} min read`;
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // If publishing for the first time, set publishedAt
      if (updates.published && !updates.publishedAt) {
        updateData.publishedAt = Timestamp.now();
      }

      await updateDoc(articleDoc, updateData);
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  // Delete an article
  static async deleteArticle(articleId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const articleDoc = doc(db, 'Articles', articleId);
      await deleteDoc(articleDoc);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  // Search articles by title, content, or tags
  static async searchArticles(searchTerm: string): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const q = query(
        articlesCollection,
        where('published', '==', true),
        orderBy('publishedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const articles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      // Client-side filtering
      const searchTermLower = searchTerm.toLowerCase();
      return articles.filter(article =>
        article.title.toLowerCase().includes(searchTermLower) ||
        article.excerpt.toLowerCase().includes(searchTermLower) ||
        article.content.toLowerCase().includes(searchTermLower) ||
        article.author.toLowerCase().includes(searchTermLower) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }

  // Get articles by author
  static async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      const q = query(
        articlesCollection,
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Error fetching articles by author:', error);
      throw error;
    }
  }

  // Increment article views
  static async incrementViews(articleId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }

      const articleDoc = doc(db, 'Articles', articleId);
      const docSnap = await getDoc(articleDoc);

      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0;
        await updateDoc(articleDoc, { views: currentViews + 1 });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view tracking
    }
  }

  // Upload article cover image
  static async uploadCoverImage(articleId: string, file: File): Promise<string> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `articles/${articleId}/cover_${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  }

  // Delete article cover image
  static async deleteCoverImage(imageUrl: string): Promise<void> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a reference from the URL
      const imageRef = ref(storage, imageUrl);

      // Delete the file
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting cover image:', error);
      // Don't throw error as image might already be deleted
    }
  }

  // Get recent articles
  static async getRecentArticles(limitCount: number = 10): Promise<Article[]> {
    try {
      if (!articlesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      const q = query(
        articlesCollection,
        where('published', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      throw error;
    }
  }
}