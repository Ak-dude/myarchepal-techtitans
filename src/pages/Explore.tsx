import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-sites";
import { Site } from "@/services/sites";
import { Timestamp } from "firebase/firestore";

const Explore = () => {
  const navigate = useNavigate();
  const { sites, loading, error } = useSites();
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

  // Show recently added sites as "trending"
  const recentSites = sites
    .filter(site => {
      const date = site.createdAt instanceof Timestamp ? site.createdAt.toDate() : site.createdAt;
      if (!date) return false;
      const daysSinceCreated = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated <= 7; // Sites created in the last 7 days
    })
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading discoveries...</p>
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
          <h1 className="text-xl font-semibold text-foreground mb-4">Explore</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discoveries, locations..."
              className="pl-10 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Recent Discoveries</h2>
            </div>
            <div className="space-y-3">
              {filteredSites.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No sites found matching your search." : "No archaeological sites available yet."}
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
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">🏛️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {site.name}
                          </h3>
                          {recentSites.includes(site) && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{getLocationDisplay(site)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(site.createdAt)}</span>
                          </div>
                          {site.period && (
                            <p className="text-xs text-muted-foreground">
                              {site.period}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Explore;
