import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, FileText, Search, Loader2, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSites } from "@/hooks/use-sites";
import { Site } from "@/services/sites";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";

const SiteLists = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sites, loading, error, fetchSites } = useSites();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSites(sites);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = sites.filter(site =>
        site.name.toLowerCase().includes(query) ||
        site.location?.address?.toLowerCase().includes(query) ||
        site.location?.country?.toLowerCase().includes(query) ||
        site.location?.region?.toLowerCase().includes(query) ||
        site.description?.toLowerCase().includes(query)
      );
      setFilteredSites(filtered);
    }
  }, [searchQuery, sites]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "inactive": return "bg-warning/10 text-warning border-warning/20";
      case "archived": return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20";
      default: return "";
    }
  };

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const getLocationDisplay = (site: Site) => {
    const parts = [];
    if (site.location?.address) parts.push(site.location.address);
    if (site.location?.region) parts.push(site.location.region);
    if (site.location?.country) parts.push(site.location.country);
    return parts.join(", ") || "Location not specified";
  };

  const handleSiteClick = (siteId: string) => {
    navigate(`/site/${siteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading sites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSites} variant="outline">
            Try Again
          </Button>
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
                onClick={() => navigate("/new-site")}
                className="hover:bg-muted"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Site
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              className="pl-10 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-primary">{sites.length}</p>
              <p className="text-xs text-muted-foreground">Total Sites</p>
            </Card>
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-success">
                {sites.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </Card>
            <Card className="p-3 border-border text-center">
              <p className="text-2xl font-bold text-foreground">
                {sites.filter(s => s.artifacts?.length).reduce((sum, s) => sum + (s.artifacts?.length || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Artifacts</p>
            </Card>
          </div>
        </header>

        <div className="p-4 space-y-3">
          {filteredSites.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <p className="text-muted-foreground">
                {searchQuery ? "No sites found matching your search." : "No sites available. Create your first site!"}
              </p>
            </Card>
          ) : (
            filteredSites.map((site) => (
              <Card
                key={site.id}
                className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSiteClick(site.id)}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {site.images && site.images.length > 0 ? (
                      <img
                        src={site.images[0]}
                        alt={site.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<span class="text-3xl">🏛️</span>';
                          }
                        }}
                      />
                    ) : (
                      <span className="text-3xl">🏛️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">
                        {site.name}
                      </h3>
                      <Badge variant="outline" className={getStatusColor(site.status)}>
                        <span className="capitalize">{site.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{getLocationDisplay(site)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(site.updatedAt || site.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {site.description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{site.artifacts?.length || 0} artifacts</span>
                        </div>
                        {site.period && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{site.period}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default SiteLists;
