import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, Image as ImageIcon, MapPin, Calendar, Ruler, Tag, Loader2, Building2, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArtifactsService, Artifact } from "@/services/artifacts";
import { SitesService, Site } from "@/services/sites";
import { AzureOpenAIService } from "@/services/azure-openai";
import { useAuth } from "@/hooks/use-auth";
import { useArchaeologist } from "@/hooks/use-archaeologist";
import { Timestamp } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const types = ["Coin", "Ceramic", "Weapon", "Glass", "Personal Ornament", "Sculpture", "Other"];
const periods = ["Imperial Roman", "Roman", "Late Roman", "Byzantine", "Medieval", "Other"];
const materials = ["Gold", "Silver", "Bronze", "Iron", "Terracotta", "Ceramic", "Glass", "Marble", "Stone", "Bone", "Wood", "Other"];
const conditions = ["Excellent", "Good", "Fair", "Fragment", "Poor"];
const significance = ["Very High", "High", "Medium", "Low"];
const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];

const EditArtifact = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isArchaeologist, canCreate } = useArchaeologist();
  const [loading, setLoading] = useState(false);
  const [fetchingArtifact, setFetchingArtifact] = useState(true);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [userSites, setUserSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    period: "",
    date: "",
    material: "",
    dimensions: "",
    location: "",
    excavationDate: new Date().toISOString().split('T')[0],
    condition: "",
    description: "",
    findContext: "",
    significance: "",
    tags: "",
    finder: "",
    siteId: "",
    forSale: false,
    salePrice: "",
    currency: "USD",
    quantity: "1",
  });

  // Fetch artifact data
  useEffect(() => {
    const fetchArtifact = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Artifact ID not found",
          variant: "destructive"
        });
        navigate("/artifacts");
        return;
      }

      try {
        setFetchingArtifact(true);
        const artifactData = await ArtifactsService.getArtifactById(id);

        if (!artifactData) {
          toast({
            title: "Error",
            description: "Artifact not found",
            variant: "destructive"
          });
          navigate("/artifacts");
          return;
        }

        // Check if user is the creator
        if (artifactData.createdBy !== user?.uid) {
          toast({
            title: "Unauthorized",
            description: "You can only edit artifacts you created",
            variant: "destructive"
          });
          navigate(`/artifact/${id}`);
          return;
        }

        setArtifact(artifactData);

        // Pre-populate form with artifact data
        const excavationDate = artifactData.excavationDate instanceof Timestamp
          ? artifactData.excavationDate.toDate()
          : artifactData.excavationDate;

        setFormData({
          name: artifactData.name || "",
          type: artifactData.type || "",
          period: artifactData.period || "",
          date: artifactData.date || "",
          material: artifactData.material || "",
          dimensions: artifactData.dimensions || "",
          location: artifactData.location || "",
          excavationDate: excavationDate ? new Date(excavationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          condition: artifactData.condition || "",
          description: artifactData.description || "",
          findContext: artifactData.findContext || "",
          significance: artifactData.significance || "",
          tags: artifactData.tags?.join(', ') || "",
          finder: artifactData.finder || "",
          siteId: artifactData.siteId || "",
          forSale: artifactData.forSale || false,
          salePrice: artifactData.salePrice?.toString() || "",
          currency: artifactData.currency || "USD",
          quantity: artifactData.quantity?.toString() || "1",
        });

        // Set existing AI summary if available
        if (artifactData.aiImageSummary) {
          setAiSummary(artifactData.aiImageSummary);
        }

        // Set existing image preview if available
        if (artifactData.images && artifactData.images.length > 0) {
          setImagePreview(artifactData.images[0]);
        }
      } catch (error) {
        console.error("Error fetching artifact:", error);
        toast({
          title: "Error",
          description: "Failed to load artifact",
          variant: "destructive"
        });
        navigate("/artifacts");
      } finally {
        setFetchingArtifact(false);
      }
    };

    fetchArtifact();
  }, [id, user, navigate, toast]);

  // Fetch sites created by the current user
  useEffect(() => {
    const fetchUserSites = async () => {
      if (!user) return;

      try {
        setSitesLoading(true);
        const allSites = await SitesService.getAllSites();
        const filteredSites = allSites.filter(site => site.createdBy === user.uid);
        setUserSites(filteredSites);
      } catch (error) {
        console.error('Error fetching user sites:', error);
        toast({
          title: "Error",
          description: "Failed to load your sites",
          variant: "destructive"
        });
      } finally {
        setSitesLoading(false);
      }
    };

    if (user && isArchaeologist) {
      fetchUserSites();
    }
  }, [user, isArchaeologist, toast]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Start AI analysis
      analyzeImageWithAI(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(artifact?.images?.[0] || null);
    setAiSummary(artifact?.aiImageSummary || "");
    setAnalyzingImage(false);
  };

  const analyzeImageWithAI = async (file: File) => {
    try {
      setAnalyzingImage(true);
      console.log('🤖 Starting AI analysis...');

      const summary = await AzureOpenAIService.analyzeArtifactImage(file);
      setAiSummary(summary);

      toast({
        title: "AI Analysis Complete",
        description: "Image has been analyzed and summary generated",
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not analyze image, but you can still save the artifact",
        variant: "destructive"
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !artifact) {
      toast({
        title: "Error",
        description: "Artifact not found",
        variant: "destructive"
      });
      return;
    }

    // Basic validation
    if (!formData.name || !formData.type || !formData.material || !formData.condition || !formData.location || !formData.description || !formData.significance || !formData.siteId) {
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
        description: "You must be signed in to edit artifacts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Find the selected site to get its name
      const selectedSite = userSites.find(site => site.id === formData.siteId);

      const updateData = {
        name: formData.name,
        type: formData.type,
        period: formData.period,
        date: formData.date || "",
        material: formData.material,
        dimensions: formData.dimensions || "",
        location: formData.location,
        excavationDate: Timestamp.fromDate(new Date(formData.excavationDate)),
        condition: formData.condition,
        description: formData.description,
        findContext: formData.findContext || "",
        significance: formData.significance,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        finder: formData.finder || "",
        aiImageSummary: aiSummary || artifact.aiImageSummary || "",
        siteName: selectedSite?.name || artifact.siteName || "",
        siteId: formData.siteId,
        forSale: formData.forSale,
        salePrice: formData.forSale && formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        currency: formData.forSale && formData.salePrice ? formData.currency : undefined,
        quantity: formData.forSale && formData.quantity ? parseInt(formData.quantity) : undefined,
      };

      await ArtifactsService.updateArtifact(id, updateData);

      // Upload new image if selected
      if (selectedImage) {
        try {
          const imageUrl = await ArtifactsService.uploadArtifactImage(id, selectedImage);
          // Append new image to existing images array
          const existingImages = artifact.images || [];
          await ArtifactsService.updateArtifactImages(id, [imageUrl, ...existingImages]);
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast({
            title: "Warning",
            description: "Artifact updated but image upload failed",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Success!",
        description: "Artifact has been successfully updated",
      });

      // Navigate back to artifact details page
      setTimeout(() => {
        navigate(`/artifact/${id}`);
      }, 1500);

    } catch (error) {
      console.error("Error updating artifact:", error);
      toast({
        title: "Error",
        description: "Failed to update artifact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingArtifact) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading artifact...</p>
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto">
          <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
            <PageHeader />
          </header>
          <div className="p-4">
            <Card>
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Only verified archaeologists can edit artifacts.
                </p>
                <Button
                  onClick={() => navigate('/authentication/sign-in')}
                  variant="outline"
                >
                  Sign In as Archaeologist
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <PageHeader />
        </header>

        <div className="p-4 space-y-6">
          <Card className="p-6 border-border">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Artifact preview"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                {selectedImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    Remove New Image
                  </Button>
                )}
              </div>
            ) : (
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center justify-center h-48 bg-muted rounded-lg mb-4 hover:bg-muted/80 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to add artifact image</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG, GIF)</p>
                  </div>
                </div>
              </label>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" className="w-full" size="sm" type="button" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedImage ? 'Change New Image' : imagePreview ? 'Add New Image' : 'Upload Image'}
                </span>
              </Button>
            </label>
          </Card>

          {/* AI Image Analysis Section */}
          {(selectedImage || aiSummary) && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    🤖 AI Image Analysis
                    {analyzingImage && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Label>
                  {aiSummary ? (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-2">Generated analysis:</p>
                      <p className="text-sm">{aiSummary}</p>
                    </div>
                  ) : analyzingImage ? (
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">Analyzing image with AI...</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">AI analysis will appear here after image upload</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Artifact Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Roman Gold Aureus"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteId" className="text-foreground">Associated Site *</Label>
              <Select
                value={formData.siteId}
                onValueChange={(value) => setFormData({ ...formData, siteId: value })}
                disabled={sitesLoading}
              >
                <SelectTrigger className="border-border">
                  <SelectValue placeholder={sitesLoading ? "Loading your sites..." : "Select a site"} />
                </SelectTrigger>
                <SelectContent>
                  {userSites.map((site) => (
                    <SelectItem key={site.id} value={site.id!}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{site.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period" className="text-foreground">Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">Date/Era</Label>
              <Input
                id="date"
                placeholder="e.g., 117-138 CE, 2nd century CE"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material" className="text-foreground">Material *</Label>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-foreground">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-foreground">Dimensions</Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dimensions"
                  placeholder="e.g., 19mm diameter, 7.3g"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="pl-10 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">Find Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Sector A, Grid 23"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="pl-10 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excavationDate" className="text-foreground">Excavation Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="excavationDate"
                  type="date"
                  value={formData.excavationDate}
                  onChange={(e) => setFormData({ ...formData, excavationDate: e.target.value })}
                  required
                  className="pl-10 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="significance" className="text-foreground">Significance *</Label>
              <Select
                value={formData.significance}
                onValueChange={(value) => setFormData({ ...formData, significance: value })}
              >
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Select significance level" />
                </SelectTrigger>
                <SelectContent>
                  {significance.map((sig) => (
                    <SelectItem key={sig} value={sig}>
                      {sig}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the artifact, notable features, decoration..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="min-h-32 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="findContext" className="text-foreground">Find Context</Label>
              <Textarea
                id="findContext"
                placeholder="Archaeological context of the find (e.g., domestic context, burial, layer info...)"
                value={formData.findContext}
                onChange={(e) => setFormData({ ...formData, findContext: e.target.value })}
                className="min-h-24 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finder" className="text-foreground">Finder Name</Label>
              <Input
                id="finder"
                placeholder="Name of person who discovered the artifact"
                value={formData.finder}
                onChange={(e) => setFormData({ ...formData, finder: e.target.value })}
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground">Tags</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="e.g., Roman, Gold, Imperial, Currency (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="pl-10 border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
            </div>

            {/* Sale Section */}
            <Card className="border-border bg-muted/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="forSale"
                    checked={formData.forSale}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, forSale: checked as boolean })
                    }
                  />
                  <Label htmlFor="forSale" className="text-foreground font-medium cursor-pointer">
                    Mark artifact for sale
                  </Label>
                </div>

                {formData.forSale && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salePrice" className="text-foreground">Price per Item *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.salePrice}
                            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                            required={formData.forSale}
                            className="pl-10 border-border"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-foreground">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                          <SelectTrigger className="border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-foreground">Quantity Available *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required={formData.forSale}
                        className="border-border"
                      />
                      <p className="text-xs text-muted-foreground">Number of items available for sale</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Artifact"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArtifact;
