import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Filter, Grid3X3, List, Loader2, Building2, Plus, ShoppingCart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";

const periods = ["All", "Imperial Roman", "Roman", "Late Roman", "Byzantine", "Medieval"];
const types = ["All", "Coin", "Ceramic", "Weapon", "Glass", "Personal Ornament", "Sculpture"];

const Artifacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { artifacts, loading, error } = useArtifacts();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForSaleOnly, setShowForSaleOnly] = useState(false);

  const filteredArtifacts = artifacts.filter(artifact => {
    if (selectedPeriod !== "All" && artifact.period !== selectedPeriod) return false;
    if (selectedType !== "All" && artifact.type !== selectedType) return false;
    if (showForSaleOnly && !artifact.forSale) return false;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return artifact.name.toLowerCase().includes(query) ||
             artifact.description.toLowerCase().includes(query) ||
             artifact.material.toLowerCase().includes(query) ||
             artifact.siteName?.toLowerCase().includes(query) ||
             artifact.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const sortedArtifacts = [...filteredArtifacts].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        const dateA = a.excavationDate instanceof Timestamp ? a.excavationDate.toDate() : a.excavationDate;
        const dateB = b.excavationDate instanceof Timestamp ? b.excavationDate.toDate() : b.excavationDate;
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      case "oldest":
        const oldDateA = a.excavationDate instanceof Timestamp ? a.excavationDate.toDate() : a.excavationDate;
        const oldDateB = b.excavationDate instanceof Timestamp ? b.excavationDate.toDate() : b.excavationDate;
        return (oldDateA?.getTime() || 0) - (oldDateB?.getTime() || 0);
      case "name":
        return a.name.localeCompare(b.name);
      case "significance":
        const sigOrder = { "Very High": 0, "High": 1, "Medium": 2, "Low": 3 };
        return (sigOrder[a.significance as keyof typeof sigOrder] || 4) - (sigOrder[b.significance as keyof typeof sigOrder] || 4);
      default:
        return 0;
    }
  });

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "Very High": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Low": return "bg-green-500/10 text-green-600 border-green-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Good": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Fair": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Fragment": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Poor": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleArtifactClick = (artifactId: string) => {
    navigate(`/artifact/${artifactId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading artifacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <PageHeader />
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/create-artifact")}
                className="hover:bg-muted"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Artifact
              </Button>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artifacts..."
              className="pl-10 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-primary">{artifacts.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </Card>
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-orange-600">
                {artifacts.filter(a => a.significance === 'High' || a.significance === 'Very High').length}
              </p>
              <p className="text-xs text-muted-foreground">Significant</p>
            </Card>
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-green-600">
                {artifacts.filter(a => a.condition === 'Excellent' || a.condition === 'Good').length}
              </p>
              <p className="text-xs text-muted-foreground">Good</p>
            </Card>
            <Card
              className={`p-3 border-border text-center cursor-pointer transition-all ${showForSaleOnly ? 'bg-blue-500/10 border-blue-500' : ''}`}
              onClick={() => setShowForSaleOnly(!showForSaleOnly)}
            >
              <p className="text-2xl font-bold text-blue-600">
                {artifacts.filter(a => a.forSale).length}
              </p>
              <p className="text-xs text-muted-foreground">For Sale</p>
            </Card>
          </div>
        </header>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="sort">Sort</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {sortedArtifacts.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No artifacts found matching your search." : "No artifacts cataloged yet."}
                  </p>
                </Card>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 gap-3" : "space-y-3"}>
                  {sortedArtifacts.map((artifact) => (
                    <Card
                      key={artifact.id}
                      className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleArtifactClick(artifact.id!)}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {artifact.images && artifact.images.length > 0 ? (
                            <img
                              src={artifact.images[0]}
                              alt={artifact.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-3xl">${
                                    artifact.type === 'Coin' ? '🪙' :
                                    artifact.type === 'Ceramic' ? '🏺' :
                                    artifact.type === 'Weapon' ? '🗡️' :
                                    artifact.type === 'Glass' ? '🍶' :
                                    artifact.type === 'Personal Ornament' ? '📎' :
                                    artifact.type === 'Sculpture' ? '🗿' :
                                    '🏺'
                                  }</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-3xl">
                              {artifact.type === 'Coin' ? '🪙' :
                               artifact.type === 'Ceramic' ? '🏺' :
                               artifact.type === 'Weapon' ? '🗡️' :
                               artifact.type === 'Glass' ? '🍶' :
                               artifact.type === 'Personal Ornament' ? '📎' :
                               artifact.type === 'Sculpture' ? '🗿' :
                               '🏺'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {artifact.name}
                            </h3>
                            <div className="flex gap-1">
                              {artifact.forSale && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                  <ShoppingCart className="w-3 h-3 mr-1" />
                                  For Sale
                                </Badge>
                              )}
                              <Badge variant="outline" className={getSignificanceColor(artifact.significance)}>
                                {artifact.significance}
                              </Badge>
                            </div>
                          </div>

                          {artifact.forSale && artifact.salePrice && (
                            <div className="mb-2 p-2 bg-blue-500/5 rounded-md border border-blue-500/10">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-semibold text-blue-600">
                                  {artifact.currency || 'USD'} {artifact.salePrice.toLocaleString()}
                                  <span className="text-xs text-muted-foreground ml-1">per item</span>
                                </span>
                                {artifact.quantity && (
                                  <span className="text-xs text-muted-foreground">
                                    Qty: {artifact.quantity}
                                  </span>
                                )}
                              </div>
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/checkout/${artifact.id}`);
                                }}
                                disabled={!artifact.quantity || artifact.quantity === 0}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1.5" />
                                {artifact.quantity && artifact.quantity > 0 ? 'Buy Now' : 'Out of Stock'}
                              </Button>
                            </div>
                          )}

                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              <span>{artifact.siteName || "Unknown Site"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{artifact.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(artifact.excavationDate)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Badge variant="outline" className={getConditionColor(artifact.condition)}>
                                {artifact.condition}
                              </Badge>
                              <span>{artifact.material}</span>
                              <span>{artifact.period}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="filters" className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="sort" className="mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="significance">Significance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Artifacts;