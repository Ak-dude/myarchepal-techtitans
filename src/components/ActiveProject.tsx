import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { useSites } from "@/hooks/use-sites";
import { Timestamp } from "firebase/firestore";

export const ActiveProject = () => {
  const navigate = useNavigate();
  const { sites, loading } = useSites();

  const activeSites = sites.filter(site => site.status === 'active').slice(0, 2);

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getLocationDisplay = (site: any) => {
    const parts = [];
    if (site.location?.region) parts.push(site.location.region);
    if (site.location?.country) parts.push(site.location.country);
    return parts.join(", ") || "Location not specified";
  };

  if (loading) {
    return (
      <div className="px-4 py-6 bg-muted/30">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-muted/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Active Sites</h3>
        <button
          onClick={() => navigate("/site-lists")}
          className="text-sm text-primary font-medium"
        >
          View All
        </button>
      </div>

      {activeSites.length === 0 ? (
        <Card className="p-6 border-border text-center">
          <p className="text-muted-foreground text-sm">No active sites available</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeSites.map((site) => (
            <Card
              key={site.id}
              className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/site/${site.id}`)}
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          parent.innerHTML = '<span class="text-2xl">🏛️</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-2xl">🏛️</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground line-clamp-1">{site.name}</h4>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 flex-shrink-0">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{getLocationDisplay(site)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Discovered: {formatDate(site.dateDiscovered)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
