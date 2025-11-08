import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Archaeologist {
  uid: string;
  email: string;
  displayName?: string;
  institution?: string;
  specialization?: string;
  credentials?: string;
  approvedAt: Date | Timestamp;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

export class ArchaeologistService {
  // Check if a user is an approved archaeologist
  static async isArchaeologist(uid: string): Promise<boolean> {
    try {
      if (!db) return false;

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      const archaeologistSnap = await getDoc(archaeologistDoc);

      if (archaeologistSnap.exists()) {
        const data = archaeologistSnap.data();
        return data.status === 'approved';
      }

      return false;
    } catch (error) {
      console.error('Error checking archaeologist status:', error);
      return false;
    }
  }

  // Register a user as an archaeologist (pending approval)
  static async registerAsArchaeologist(
    uid: string,
    email: string,
    displayName?: string,
    institution?: string,
    specialization?: string,
    credentials?: string
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const archaeologistData: Archaeologist = {
        uid,
        email,
        displayName,
        institution,
        specialization,
        credentials,
        approvedAt: Timestamp.now(),
        approvedBy: uid, // Self-registration for now
        status: 'approved' // Auto-approve for demo purposes
      };

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      await setDoc(archaeologistDoc, archaeologistData);

      console.log('✅ User registered as archaeologist:', uid);
    } catch (error) {
      console.error('❌ Error registering archaeologist:', error);
      throw error;
    }
  }

  // Approve an archaeologist (admin function)
  static async approveArchaeologist(uid: string, approvedBy: string): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      await setDoc(archaeologistDoc, {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy
      }, { merge: true });

      console.log('✅ Archaeologist approved:', uid);
    } catch (error) {
      console.error('❌ Error approving archaeologist:', error);
      throw error;
    }
  }

  // Remove archaeologist status
  static async removeArchaeologist(uid: string): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      await deleteDoc(archaeologistDoc);

      console.log('✅ Archaeologist status removed:', uid);
    } catch (error) {
      console.error('❌ Error removing archaeologist:', error);
      throw error;
    }
  }

  // Get archaeologist profile by UID
  static async getArchaeologistProfile(uid: string): Promise<Archaeologist | null> {
    try {
      if (!db) return null;

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      const archaeologistSnap = await getDoc(archaeologistDoc);

      if (archaeologistSnap.exists()) {
        return archaeologistSnap.data() as Archaeologist;
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching archaeologist profile:', error);
      return null;
    }
  }

  // Update archaeologist profile
  static async updateArchaeologistProfile(
    uid: string,
    updates: Partial<Omit<Archaeologist, 'uid' | 'approvedAt' | 'approvedBy' | 'status'>>
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const archaeologistDoc = doc(db, 'archaeologists', uid);
      await setDoc(archaeologistDoc, updates, { merge: true });

      console.log('✅ Archaeologist profile updated:', uid);
    } catch (error) {
      console.error('❌ Error updating archaeologist profile:', error);
      throw error;
    }
  }

  // Get all archaeologists
  static async getAllArchaeologists(): Promise<Archaeologist[]> {
    try {
      if (!db) return [];

      const archaeologistsCollection = collection(db, 'archaeologists');
      const querySnapshot = await getDocs(archaeologistsCollection);

      return querySnapshot.docs.map(doc => ({
        ...doc.data()
      } as Archaeologist));
    } catch (error) {
      console.error('❌ Error fetching archaeologists:', error);
      return [];
    }
  }
}