import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const FirebaseDebug = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setStatus('Testing Firebase connection...');

    try {
      // Test 1: Check if db is available
      if (!db) {
        setStatus('❌ Firestore database is not initialized');
        return;
      }
      setStatus('✅ Firestore database is available');

      // Test 2: Try to get the Sites collection
      const sitesCollection = collection(db, 'Sites');
      setStatus('✅ Sites collection reference created');

      // Test 3: Try to read from Sites collection
      const querySnapshot = await getDocs(sitesCollection);
      setStatus(`✅ Successfully read Sites collection (${querySnapshot.size} documents found)`);

      // Test 4: Try to write a test document
      const testDoc = {
        name: 'Firebase Test Site',
        description: 'This is a test document to verify Firebase write access',
        location: {
          latitude: 0,
          longitude: 0,
          address: 'Test Location'
        },
        status: 'active',
        dateDiscovered: new Date(),
        artifacts: [],
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(sitesCollection, testDoc);
      setStatus(`✅ Successfully wrote test document with ID: ${docRef.id}`);

    } catch (error) {
      console.error('Firebase test error:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Firebase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded text-sm font-mono">
          {status}
        </div>
        <Button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>
      </CardContent>
    </Card>
  );
};