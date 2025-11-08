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

// Site interface matching your Firestore document structure
export interface Site {
  id?: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    country?: string;
    region?: string;
  };
  description: string;
  dateDiscovered: Date | Timestamp;
  period?: string;
  artifacts?: string[];
  images?: string[];
  status: 'active' | 'inactive' | 'archived';
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  createdBy?: string;
}

// Collection reference - with error handling
let sitesCollection: CollectionReference<DocumentData> | undefined;
try {
  if (db) {
    sitesCollection = collection(db, 'Sites');
  }
} catch (error) {
  console.error('Failed to create Sites collection reference:', error);
}

// Sites Service Class
export class SitesService {
  // Get all sites
  static async getAllSites(): Promise<Site[]> {
    try {
      if (!sitesCollection || !db) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(sitesCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Site));
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  }

  // Get a single site by ID
  static async getSiteById(siteId: string): Promise<Site | null> {
    try {
      if (!db) {
        console.warn('Firebase is not properly initialized');
        return null;
      }
      const siteDoc = doc(db, 'Sites', siteId);
      const siteSnapshot = await getDoc(siteDoc);

      if (siteSnapshot.exists()) {
        return {
          id: siteSnapshot.id,
          ...siteSnapshot.data()
        } as Site;
      }
      return null;
    } catch (error) {
      console.error('Error fetching site:', error);
      throw error;
    }
  }

  // Create a new site
  static async createSite(siteData: Omit<Site, 'id'>): Promise<string> {
    try {
      console.log('🏛️ Creating new site with data:', siteData);

      if (!sitesCollection) {
        console.error('❌ Sites collection is not initialized');
        console.error('Database instance:', db ? '✅ Available' : '❌ Missing');
        throw new Error('Firebase Firestore is not properly initialized');
      }

      if (!db) {
        console.error('❌ Firestore database is not initialized');
        throw new Error('Firebase database is not available');
      }

      const newSiteData = {
        ...siteData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('📝 Attempting to save to Firestore Sites collection...');
      const docRef: DocumentReference = await addDoc(sitesCollection, newSiteData);
      console.log('✅ Site created successfully with ID:', docRef.id);

      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error creating site:', error);
      console.error('Error details:', {
        message: error.message || 'Unknown error',
        code: error.code || 'No code',
        customData: error.customData || 'No custom data',
        sitesCollection: sitesCollection ? '✅ Available' : '❌ Missing',
        db: db ? '✅ Available' : '❌ Missing'
      });

      // Check for specific Firebase errors
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please make sure you are signed in and Firestore security rules allow this operation.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is currently unavailable. Please try again later.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be authenticated to create sites. Please sign in again.');
      } else {
        throw new Error(`Failed to create site: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Update an existing site
  static async updateSite(siteId: string, updates: Partial<Site>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const siteDoc = doc(db, 'Sites', siteId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(siteDoc, updateData);
    } catch (error) {
      console.error('Error updating site:', error);
      throw error;
    }
  }

  // Delete a site
  static async deleteSite(siteId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const siteDoc = doc(db, 'Sites', siteId);
      await deleteDoc(siteDoc);
    } catch (error) {
      console.error('Error deleting site:', error);
      throw error;
    }
  }

  // Search sites by location (country/region)
  static async searchSitesByLocation(location: string): Promise<Site[]> {
    try {
      if (!sitesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        sitesCollection,
        where('location.country', '==', location)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Site));
    } catch (error) {
      console.error('Error searching sites:', error);
      throw error;
    }
  }

  // Get recent sites
  static async getRecentSites(limitCount: number = 10): Promise<Site[]> {
    try {
      if (!sitesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        sitesCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Site));
    } catch (error) {
      console.error('Error fetching recent sites:', error);
      throw error;
    }
  }

  // Get active sites
  static async getActiveSites(): Promise<Site[]> {
    try {
      if (!sitesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        sitesCollection,
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Site));
    } catch (error) {
      console.error('Error fetching active sites:', error);
      throw error;
    }
  }

  // Default NC archaeological sites data
  static getDefaultNCSites(): Omit<Site, 'id'>[] {
    return [
      {
        name: "The Shelly Point Site",
        location: {
          latitude: 34.2104,
          longitude: -77.8868,
          address: "Shallotte Point, Brunswick County",
          country: "United States",
          region: "North Carolina"
        },
        description: "A significant prehistoric Native American site featuring shell middens and archaeological evidence of coastal occupation dating back over 2,000 years. The site provides important insights into the maritime adaptations of indigenous peoples along the North Carolina coast.",
        dateDiscovered: new Date('1960-01-01'),
        period: "Late Woodland Period",
        artifacts: ["shell tools", "pottery sherds", "stone projectile points", "bone fishing implements"],
        images: [],
        status: 'active' as const,
        createdBy: 'system'
      },
      {
        name: "Blue Rock Soapstone Quarry",
        location: {
          latitude: 35.8781,
          longitude: -81.0659,
          address: "Lincolnton, Lincoln County",
          country: "United States",
          region: "North Carolina"
        },
        description: "An important prehistoric quarry site where Native Americans extracted soapstone for making bowls, pipes, and other tools. Archaeological evidence shows continuous use from the Archaic period through the Historic period, spanning over 8,000 years of human activity.",
        dateDiscovered: new Date('1975-01-01'),
        period: "Archaic to Historic Period",
        artifacts: ["soapstone bowl fragments", "quarrying tools", "stone adzes", "prehistoric pottery"],
        images: [],
        status: 'active' as const,
        createdBy: 'system'
      },
      {
        name: "The Town Creek Site",
        location: {
          latitude: 35.0087,
          longitude: -79.8936,
          address: "Mount Gilead, Montgomery County",
          country: "United States",
          region: "North Carolina"
        },
        description: "A major ceremonial center of the Pee Dee culture dating from 1150-1400 CE. The site features a reconstructed temple mound, palisade walls, and evidence of a sophisticated Native American community. Now a state historic site and museum.",
        dateDiscovered: new Date('1937-01-01'),
        period: "Late Mississippian Period",
        artifacts: ["ceremonial pottery", "copper ornaments", "stone tools", "shell beads", "burial goods"],
        images: [],
        status: 'active' as const,
        createdBy: 'system'
      },
      {
        name: "Fort Fisher State Historic Site",
        location: {
          latitude: 33.9584,
          longitude: -77.9428,
          address: "Kure Beach, New Hanover County",
          country: "United States",
          region: "North Carolina"
        },
        description: "A Civil War fortification that was crucial in protecting the port of Wilmington. The largest earthwork fortification in the Confederacy, it played a key role in the Civil War and features extensive archaeological remains of military structures and artifacts.",
        dateDiscovered: new Date('1865-01-01'),
        period: "Civil War Era (1861-1865)",
        artifacts: ["cannon fragments", "military buttons", "rifle musket balls", "fortification materials", "personal effects"],
        images: [],
        status: 'active' as const,
        createdBy: 'system'
      },
      {
        name: "Cape Fear Shipwreck District",
        location: {
          latitude: 33.8569,
          longitude: -78.0178,
          address: "Cape Fear River, New Hanover County",
          country: "United States",
          region: "North Carolina"
        },
        description: "An underwater archaeological district containing numerous shipwrecks spanning from the Colonial period to the 20th century. The site includes merchant vessels, blockade runners, and military ships, providing insights into maritime history and underwater archaeology.",
        dateDiscovered: new Date('1980-01-01'),
        period: "Colonial to Modern Period",
        artifacts: ["ship hardware", "ceramic trade goods", "navigation instruments", "cannon", "personal belongings"],
        images: [],
        status: 'active' as const,
        createdBy: 'system'
      }
    ];
  }

  // Initialize default NC sites (call this once to populate the database)
  static async initializeDefaultNCSites(): Promise<void> {
    try {
      console.log('🏛️ Initializing default NC archaeological sites...');

      // Check if sites already exist to avoid duplicates
      const existingSites = await this.getAllSites();
      const defaultSites = this.getDefaultNCSites();

      for (const siteData of defaultSites) {
        // Check if site already exists by name
        const exists = existingSites.some(site => site.name === siteData.name);

        if (!exists) {
          console.log(`📝 Adding default site: ${siteData.name}`);
          await this.createSite(siteData);
        } else {
          console.log(`✅ Site already exists: ${siteData.name}`);
        }
      }

      console.log('🎉 Default NC sites initialization complete!');
    } catch (error) {
      console.error('❌ Error initializing default NC sites:', error);
      throw error;
    }
  }

  // Get North Carolina sites specifically
  static async getNCSites(): Promise<Site[]> {
    try {
      if (!sitesCollection) {
        console.warn('Firebase is not properly initialized');
        return [];
      }
      const q = query(
        sitesCollection,
        where('location.region', '==', 'North Carolina')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Site));
    } catch (error) {
      console.error('Error fetching NC sites:', error);
      throw error;
    }
  }

  // Upload site image
  static async uploadSiteImage(siteId: string, file: File): Promise<string> {
    try {
      console.log('🔄 Starting site image upload...');
      console.log('Storage instance:', storage ? '✅ Available' : '❌ Not available');
      console.log('File info:', { name: file.name, size: file.size, type: file.type });

      if (!storage) {
        console.error('❌ Firebase Storage is not initialized');
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `sites/${siteId}/${timestamp}_${file.name}`;
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
      console.error('❌ Error uploading site image:');
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

  // Delete site image
  static async deleteSiteImage(imageUrl: string): Promise<void> {
    try {
      if (!storage) {
        throw new Error('Firebase Storage is not properly initialized');
      }

      // Create a reference from the URL
      const imageRef = ref(storage, imageUrl);

      // Delete the file
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting site image:', error);
      // Don't throw error as image might already be deleted
    }
  }

  // Update site with image URLs
  static async updateSiteImages(siteId: string, imageUrls: string[]): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase is not properly initialized');
      }
      const siteDoc = doc(db, 'Sites', siteId);

      await updateDoc(siteDoc, {
        images: imageUrls,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating site images:', error);
      throw error;
    }
  }
}