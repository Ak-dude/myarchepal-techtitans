import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight, Loader2, MapPin } from "lucide-react";
import { useSites } from "@/hooks/use-sites";
import { Timestamp } from "firebase/firestore";

export const RecentFinds = () => {
  const navigate = useNavigate();
  const { sites, loading } = useSites();

  // Get the 3 most recently created sites
  const recentSites = sites
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    })
    .slice(0, 3);

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getLocationDisplay = (site: any) => {
    const parts = [];
    if (site.location?.region) parts.push(site.location.region);
    if (site.location?.country) parts.push(site.location.country);
    return parts.join(", ") || "Location not specified";
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Recent Discoveries</h3>
        <button
          onClick={() => navigate("/explore")}
          className="text-sm text-primary font-medium"
        >
          See All
        </button>
      </div>

      {recentSites.length === 0 ? (
        <Card className="p-6 border-border text-center">
          <p className="text-muted-foreground text-sm">No recent discoveries</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {recentSites.map((site) => (
            <Card
              key={site.id}
              className="p-3 hover:shadow-md transition-all cursor-pointer border-border flex items-center justify-between"
              onClick={() => navigate(`/site/${site.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
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
                <div>
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">{site.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{getLocationDisplay(site)} • {formatDate(site.createdAt)}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
