/**
 * Edit Profile Page Component
 * 
 * Allows authenticated users to edit their profile information.
 * Features:
 * - Loads current user data from authentication storage
 * - Updates user profile with new information
 * - Saves changes to localStorage via auth utilities
 * - Automatically refreshes auth context after update
 * 
 * Routes: /edit-profile
 * Requires: Authentication (redirects to sign-in if not authenticated)
 1*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Mail, Building2, Award, Shield, User, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArchaeologistService, Archaeologist } from "@/services/archaeologists";

const EditProfile = () => {
  // React Router hook for navigation
  const navigate = useNavigate();
  // Toast notification hook for user feedback
  const { toast } = useToast();
  // Auth context hook to get current user
  const { user } = useAuth();

  // State for archaeologist profile data
  const [archaeologistProfile, setArchaeologistProfile] = useState<Archaeologist | null>(null);
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state management - stores profile data
  const [formData, setFormData] = useState({
    displayName: "",
    institution: "",
    specialization: "",
    credentials: "",
  });

  /**
   * Load current archaeologist profile data when user is available
   * Redirects to sign-in if user is not authenticated
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.uid) {
        setLoading(true);
        try {
          const profile = await ArchaeologistService.getArchaeologistProfile(user.uid);
          setArchaeologistProfile(profile);

          // Populate form with current data
          setFormData({
            displayName: profile?.displayName || user.displayName || "",
            institution: profile?.institution || "",
            specialization: profile?.specialization || "",
            credentials: profile?.credentials || "",
          });
        } catch (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (user === null) {
        // Redirect to sign-in if not authenticated
        navigate("/authentication/sign-in");
      }
    };

    loadProfile();
  }, [user, navigate, toast]);

  /**
   * Handle form submission
   * Updates archaeologist profile in Firestore
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent default form submission

    // Double-check authentication before updating
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Please sign in to update your profile",
        variant: "destructive",
      });
      navigate("/authentication/sign-in");
      return;
    }

    setSaving(true);
    try {
      if (archaeologistProfile) {
        // Update existing archaeologist profile
        await ArchaeologistService.updateArchaeologistProfile(user.uid, {
          displayName: formData.displayName,
          institution: formData.institution,
          specialization: formData.specialization,
          credentials: formData.credentials,
        });
      } else {
        // Create new archaeologist profile if user is not already an archaeologist
        await ArchaeologistService.registerAsArchaeologist(
          user.uid,
          user.email || "",
          formData.displayName,
          formData.institution,
          formData.specialization,
          formData.credentials
        );
      }

      // Show success notification
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Navigate back to account page
      navigate("/account");
    } catch (error: any) {
      // Show error notification if update fails
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/account")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Edit Profile</h1>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {loading ? (
            <Card className="p-8 border-border">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading profile...</span>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6 border-border">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                    <AvatarFallback>
                      {(formData.displayName || user?.displayName || user?.email || "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground text-center">
                    {archaeologistProfile ? 'Archaeologist Profile' : 'User Profile'}
                  </p>
                </div>
              </Card>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="Enter your display name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      required
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 border-border bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-foreground">Institution</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="institution"
                      placeholder="Enter your institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-foreground">Specialization</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="specialization"
                      placeholder="e.g., Roman Archaeology, Medieval Studies"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentials" className="text-foreground">Credentials</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="credentials"
                      placeholder="e.g., PhD in Archaeology, University of Oxford"
                      value={formData.credentials}
                      onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                      className="pl-10 border-border min-h-[80px]"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/account")}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default EditProfile;