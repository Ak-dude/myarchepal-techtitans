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

// Artifact interface matching your Firestore document structure
export interface Artifact {
  id?: string;
  name: string;
  type: string;
  period: string;
  date?: string; // Era/dating string like "117-138 CE"
  material: string;
  dimensions?: string;
  location: string; // Find location within site (e.g., "Sector A, Grid 23")
  excavationDate: Date | Timestamp;
  condition: string;
  description: string;
  findContext?: string;
  significance: string;
  tags?: string[];
  finder?: string;
  images?: string[];
  aiImageSummary?: string; // AI-generated summary of uploaded image
  siteId: string; // Reference to the site this artifact belongs to
  siteName?: string; // Denormalized site name for easier display
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  createdBy?: string; // UID of the archaeologist who cataloged it
  // Sale-related fields
  forSale?: boolean; // Whether the artifact is marked for sale
  salePrice?: number; // Price per item when marked for sale
  currency?: string; // Currency code (e.g., "USD", "EUR", "GBP")
  quantity?: number; // Number of items available for sale
}

// Collection reference - with error handling
let artifactsCollection: CollectionReference<DocumentData> | undefined;
try {
  if (db) {
    artifactsCollection = collection(db, 'Artifacts');
  }
} catch (error) {
  console.error('Failed to create Artifacts collection reference:', error);
}

// Artifacts Service Class
export class ArtifactsService {
  // Get all artifacts
  static async getAllArtifacts(): Promise<Artifact[]> {
    try {
      if (!artifactsCollection || !db) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(artifactsCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Artifact));
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      throw error;
    }
  }

  // Get a single artifact by ID
  static async getArtifactById(artifactId: string): Promise<Artifact | null> {
    try {
      if (!db) {
        console.warn('Firebase is not properly initialized');
        return null;
      }
      const artifactDoc = doc(db, 'Artifacts', artifactId);
      const artifactSnapshot = await getDoc(artifactDoc);

      if (artifactSnapshot.exists()) {
        return {
          id: artifactSnapshot.id,
          ...artifactSnapshot.data()
        } as Artifact;
      }
      return null;
    } catch (error) {
      console.error('Error fetching artifact:', error);
      throw error;
    }
  }

  // Get artifacts by site ID
  static async getArtifactsBySite(siteId: string): Promise<Artifact[]> {
    try {
      if (!artifactsCollection || !db) {
        console.warn('Firebase is not properly initialized');
        return [];
      }

      // Try with orderBy first (requires composite index)
      try {
        const q = query(
          artifactsCollection,
          where('siteId', '==', siteId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Artifact));
      } catch (indexError: any) {
        // If composite index doesn't exist, fallback to simple where query
        console.log('Composite index not found, using simple query. Consider creating an index for better performance.');

        const simpleQuery = query(
          artifactsCollection,
          where('siteId', '==', siteId)
        );

        const querySnapshot = await getDocs(simpleQuery);
        // Sort manually in memory
        const artifacts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Artifact));

        // Sort by createdAt manually
        return artifacts.sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }
    } catch (error) {
      console.error('Error fetching artifacts by site:', error);
      // Return empty array instead of throwing to prevent page errors
      return [];
    }
  }

  // Create a new artifact
  static async createArtifact(artifactData: Omit<Artifact, 'id'>): Promise<string> {
    try {
      console.log('🏺 Creating new artifact with data:', artifactData);

      if (!artifactsCollection) {
        console.error('❌ Artifacts collection is not initialized');
        console.error('Database instance:', db ? '✅ Available' : '❌ Missing');
        throw new Error('Firebase Firestore is not properly initialized');
      }

      if (!db) {
        console.error('❌ Firestore database is not initialized');
        throw new Error('Firebase database is not available');
      }

      const newArtifactData = {
        ...artifactData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('📝 Attempting to save to Firestore Artifacts collection...');
      const docRef: DocumentReference = await addDoc(artifactsCollection, newArtifactData);
      console.log('✅ Artifact created successfully with ID:', docRef.id);

      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error creating artifact:', error);
      console.error('Error details:', {
        message: error.message || 'Unknown error',
        code: error.code || 'No code',
        customData: error.customData || 'No custom data',
        artifactsCollection: artifactsCollection ? '✅ Available' : '❌ Missing',
        db: db ? '✅ Available' : '❌ Missing'
      });

      // Check for specific Firebase errors
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are signed in and Firestore security rules allow this operation.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is currently unavailable. Please try again later.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be authenticated to create artifacts. Please sign in again.');
      } else {
        throw new Error(`Failed to create artifact: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Update an existing artifact
  static async updateArtifact(artifactId: string, updates: Partial<Artifact>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const artifactDoc = doc(db, 'Artifacts', artifactId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(artifactDoc, updateData);
    } catch (error) {
      console.error('Error updating artifact:', error);
      throw error;
    }
  }

  // Delete an artifact
  static async deleteArtifact(artifactId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const artifactDoc = doc(db, 'Artifacts', artifactId);
      await deleteDoc(artifactDoc);
    } catch (error) {
      console.error('Error deleting artifact:', error);
      throw error;
    }
  }

  // Search artifacts by type
  static async searchArtifactsByType(type: string): Promise<Artifact[]> {
    try {
      if (!artifactsCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        artifactsCollection,
        where('type', '==', type)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Artifact));
    } catch (error) {
      console.error('Error searching artifacts by type:', error);
      throw error;
    }
  }

  // Get recent artifacts
  static async getRecentArtifacts(limitCount: number = 10): Promise<Artifact[]> {
    try {
      if (!artifactsCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        artifactsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Artifact));
    } catch (error) {
      console.error('Error fetching recent artifacts:', error);
      throw error;
    }
  }

  // Get artifacts by significance level
  static async getArtifactsBySignificance(significance: string): Promise<Artifact[]> {
    try {
      if (!artifactsCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        artifactsCollection,
        where('significance', '==', significance),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Artifact));
    } catch (error) {
      console.error('Error fetching artifacts by significance:', error);
      throw error;
    }
  }

  // Upload artifact image
  static async uploadArtifactImage(artifactId: string, file: File): Promise<string> {
    try {
      console.log('🔄 Starting image upload...');
      console.log('Storage instance:', storage ? '✅ Available' : '❌ Not available');
      console.log('File info:', { name: file.name, size: file.size, type: file.type });

      if (!storage) {
        console.error('❌ Firebase Storage is not initialized');
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `artifacts/${artifactId}/${timestamp}_${file.name}`;
      console.log('📁 Upload path:', filename);

      const storageRef = ref(storage, filename);
      console.log('🎯 Storage ref created:', storageRef.toString());

      // Upload the file
      console.log('⬆️ Uploading file...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Upload completed:', snapshot.metadata);

      // Get the download URL
      console.log('🔗 Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);

      return downloadURL;
    } catch (error: any) {
      console.error('❌ Error uploading artifact image:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);

      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Upload unauthorized. Please check Firebase Storage security rules.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Storage quota exceeded. Please upgrade your Firebase plan.');
      } else if (error.code === 'storage/unauthenticated') {
        throw new Error('You must be signed in to upload images.');
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Delete artifact image
  static async deleteArtifactImage(imageUrl: string): Promise<void> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a reference from the URL
      const imageRef = ref(storage, imageUrl);

      // Delete the file
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting artifact image:', error);
      // Don't throw error as image might already be deleted
    }
  }

  // Update artifact with image URLs
  static async updateArtifactImages(artifactId: string, imageUrls: string[]): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const artifactDoc = doc(db, 'Artifacts', artifactId);

      await updateDoc(artifactDoc, {
        images: imageUrls,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating artifact images:', error);
      throw error;
    }
  }
}