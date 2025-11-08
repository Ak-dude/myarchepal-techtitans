import { useState } from 'react';
import { useSites } from '@/hooks/use-sites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';

export const TestFirestore = () => {
  const { sites, loading, error, createSite, deleteSite } = useSites();
  const [testResult, setTestResult] = useState<string>('');

  const testCreateSite = async () => {
    try {
      const testSite = {
        name: 'Test Archaeological Site',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Test Location',
          country: 'USA',
          region: 'New York'
        },
        description: 'This is a test site created to verify Firestore connection',
        dateDiscovered: Timestamp.now(),
        period: 'Modern',
        status: 'active' as const,
        artifacts: ['test-artifact-1'],
        images: [],
        createdBy: 'test-user'
      };

      const siteId = await createSite(testSite);
      setTestResult(`✅ Successfully created test site with ID: ${siteId}`);

      // Clean up - delete the test site after 3 seconds
      setTimeout(async () => {
        if (siteId) {
          await deleteSite(siteId);
          setTestResult(prev => prev + '\n✅ Test site deleted successfully');
        }
      }, 3000);
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Firestore Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Connection Status:</p>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <p className="text-green-500">✅ Connected to Firestore</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Sites in Database:</p>
          <p className="font-semibold">{sites.length} sites found</p>
        </div>

        <div className="space-y-2">
          <Button onClick={testCreateSite} variant="outline">
            Test Create & Delete Site
          </Button>

          {testResult && (
            <pre className="text-sm p-2 bg-gray-100 rounded whitespace-pre-wrap">
              {testResult}
            </pre>
          )}
        </div>

        {sites.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Existing Sites:</p>
            <ul className="space-y-1">
              {sites.map((site) => (
                <li key={site.id} className="text-sm">
                  • {site.name} ({site.status})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};