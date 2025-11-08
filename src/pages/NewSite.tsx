import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, FileText, Camera, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomNav } from "@/components/BottomNav";
import { useToast } from "@/components/ui/use-toast";
import { SitesService } from "@/services/sites";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useArchaeologist } from "@/hooks/use-archaeologist";

const NewSite = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isArchaeologist, loading: archaeologistLoading, canCreate } = useArchaeologist();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      country: "",
      region: "",
      latitude: "",
      longitude: ""
    },
    period: "",
    status: "active",
    dateDiscovered: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Log user information
    console.log('🏛️ Creating site - User info:', {
      user: user,
      uid: user?.uid,
      email: user?.email,
      isAuthenticated: !!user
    });

    // Basic validation
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to create a site",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const siteData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.location.address || "",
          country: formData.location.country || "",
          region: formData.location.region || "",
          latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : 0,
          longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : 0
        },
        period: formData.period || "",
        status: formData.status as "active" | "inactive" | "archived",
        dateDiscovered: Timestamp.fromDate(new Date(formData.dateDiscovered)),
        artifacts: [],
        images: [],
        createdBy: user?.uid || "anonymous"
      };

      const siteId = await SitesService.createSite(siteData);

      toast({
        title: "Success!",
        description: "Archaeological site has been added successfully",
      });

      // Navigate to site lists after successful creation
      setTimeout(() => {
        navigate("/site-lists");
      }, 1500);

    } catch (error) {
      console.error("Error creating site:", error);
      toast({
        title: "Error",
        description: "Failed to create site. Please check your Firebase configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Add New Site</h1>
          </div>
        </header>

        {/* Auth & Archaeologist Status */}
        <div className="p-4 bg-muted/50">
          <div className="text-sm space-y-1">
            <div>
              <strong>Auth Status:</strong> {user ? `✅ Signed in as ${user.email}` : '❌ Not signed in'}
            </div>
            <div>
              <strong>Archaeologist Status:</strong> {
                archaeologistLoading ? '⏳ Checking...' :
                isArchaeologist ? '✅ Verified Archaeologist' : '❌ Not an archaeologist'
              }
            </div>
            <div>
              <strong>Can Create:</strong> {canCreate ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        </div>

        {/* Show message for non-archaeologists */}
        {!canCreate && (
          <div className="p-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {!user ? 'Please sign in as an archaeologist to create archaeological sites.' :
                   !isArchaeologist ? 'Only verified archaeologists can create sites.' :
                   'Loading...'}
                </p>
                {!user && (
                  <Button
                    onClick={() => navigate('/authentication/sign-in')}
                    variant="outline"
                  >
                    Sign In as Archaeologist
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form - Only show if user can create */}
        {canCreate && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Ancient Roman Villa"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide a detailed description of the archaeological site..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="period">Historical Period</Label>
                <Input
                  id="period"
                  name="period"
                  placeholder="e.g., Roman Empire, Bronze Age"
                  value={formData.period}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="dateDiscovered">Date Discovered</Label>
                <Input
                  id="dateDiscovered"
                  name="dateDiscovered"
                  type="date"
                  value={formData.dateDiscovered}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange(value, "status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location.address">Address</Label>
                <Input
                  id="location.address"
                  name="location.address"
                  placeholder="Street address or location description"
                  value={formData.location.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location.region">Region/State</Label>
                  <Input
                    id="location.region"
                    name="location.region"
                    placeholder="e.g., Lazio"
                    value={formData.location.region}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="location.country">Country</Label>
                  <Input
                    id="location.country"
                    name="location.country"
                    placeholder="e.g., Italy"
                    value={formData.location.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location.latitude">Latitude</Label>
                  <Input
                    id="location.latitude"
                    name="location.latitude"
                    type="number"
                    step="0.000001"
                    placeholder="41.902783"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="location.longitude">Longitude</Label>
                  <Input
                    id="location.longitude"
                    name="location.longitude"
                    type="number"
                    step="0.000001"
                    placeholder="12.496365"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload (placeholder for future implementation) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Images (Coming Soon)
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Image upload functionality will be available in the next update
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Site...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Archaeological Site
                </>
              )}
            </Button>
          </div>
        </form>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

export default NewSite;