import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArchaeologistService } from '@/services/archaeologists';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, UserCheck, GraduationCap } from 'lucide-react';

export const ArchaeologistRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    institution: '',
    specialization: '',
    credentials: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to register as an archaeologist",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await ArchaeologistService.registerAsArchaeologist(
        user.uid,
        user.email || '',
        user.displayName || '',
        formData.institution,
        formData.specialization,
        formData.credentials
      );

      setIsRegistered(true);
      toast({
        title: "Success!",
        description: "You are now registered as an archaeologist and can create sites, articles, and artifacts.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register as archaeologist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Archaeologist Registered!</h3>
          <p className="text-muted-foreground mb-4">
            You can now create sites, articles, and artifacts.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Register as Archaeologist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          To create sites, articles, and artifacts, you need to register as an archaeologist.
        </p>

        <div className="space-y-3">
          <div>
            <Label htmlFor="institution">Institution/Organization</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g., University of Archaeology"
              value={formData.institution}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              name="specialization"
              placeholder="e.g., Ancient Roman History"
              value={formData.specialization}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="credentials">Credentials/Qualifications</Label>
            <Textarea
              id="credentials"
              name="credentials"
              placeholder="e.g., PhD in Archaeology, Published researcher..."
              value={formData.credentials}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>

        <Button
          onClick={handleRegister}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            'Register as Archaeologist'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Registration is automatically approved for demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
};