import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Loader2, Building2, Layers, FileText } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/use-sites";
import { useArtifacts } from "@/hooks/use-artifacts";
import { Site } from "@/services/sites";
import { Timestamp } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Article {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  author?: string;
  tags?: string[];
  image?: string;
  imageEmoji?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

const Explore = () => {
  const navigate = useNavigate();
  const { sites, loading: sitesLoading } = useSites();
  const { artifacts, loading: artifactsLoading } = useArtifacts();
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (!db) {
          setArticlesLoading(false);
          return;
        }
        const articlesCollection = collection(db, 'Articles');
        const querySnapshot = await getDocs(articlesCollection);
        const articlesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Article));
        setArticles(articlesData);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
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

  // Filter items from last 24 hours
  const isWithinLast24Hours = (date: Date | Timestamp | undefined) => {
    if (!date) return false;
    const d = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours <= 24;
  };

  // Get items from last 24 hours or latest
  const recentSites = sites
    .filter(site => isWithinLast24Hours(site.createdAt))
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

  const recentArtifacts = artifacts
    .filter(artifact => isWithinLast24Hours(artifact.createdAt))
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

  const recentArticles = articles
    .filter(article => isWithinLast24Hours(article.createdAt))
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

  // If nothing in last 24 hours, show latest
  const displaySites = recentSites.length > 0 ? recentSites : sites.slice(0, 1).sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
    return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
  });

  const displayArtifacts = recentArtifacts.length > 0 ? recentArtifacts : artifacts.slice(0, 1).sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
    return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
  });

  const displayArticles = recentArticles.length > 0 ? recentArticles : articles.slice(0, 1).sort((a, b) => {
    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
    return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
  });

  const loading = sitesLoading || artifactsLoading || articlesLoading;

  // Search filtering
  const filteredSites = searchQuery.trim() === "" ? displaySites : displaySites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.location?.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArtifacts = searchQuery.trim() === "" ? displayArtifacts : displayArtifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artifact.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artifact.material?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = searchQuery.trim() === "" ? displayArticles : displayArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <div className="mb-4">
            <PageHeader />
          </div>
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

        <div className="p-4 space-y-6">
          {/* Sites Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  {recentSites.length > 0 ? "Sites (Last 24 Hours)" : "Latest Site"}
                </h2>
              </div>
              <button
                onClick={() => navigate("/site-lists")}
                className="text-sm text-primary font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {filteredSites.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <p className="text-muted-foreground text-sm">No sites available</p>
                </Card>
              ) : (
                filteredSites.map((site) => (
                  <Card
                    key={site.id}
                    className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/site/${site.id}`)}
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
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {site.name}
                          </h3>
                          {isWithinLast24Hours(site.createdAt) && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{getLocationDisplay(site)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(site.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Artifacts Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  {recentArtifacts.length > 0 ? "Artifacts (Last 24 Hours)" : "Latest Artifact"}
                </h2>
              </div>
              <button
                onClick={() => navigate("/artifacts")}
                className="text-sm text-primary font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {filteredArtifacts.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <p className="text-muted-foreground text-sm">No artifacts available</p>
                </Card>
              ) : (
                filteredArtifacts.map((artifact) => (
                  <Card
                    key={artifact.id}
                    className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/artifact/${artifact.id}`)}
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
                             '🏺'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {artifact.name}
                          </h3>
                          {isWithinLast24Hours(artifact.createdAt) && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {artifact.type} • {artifact.material}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(artifact.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Articles Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  {recentArticles.length > 0 ? "Articles (Last 24 Hours)" : "Latest Article"}
                </h2>
              </div>
              <button
                onClick={() => navigate("/articles")}
                className="text-sm text-primary font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {filteredArticles.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <p className="text-muted-foreground text-sm">No articles available</p>
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/articles`)}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = article.imageEmoji
                                  ? `<span class="text-3xl">${article.imageEmoji}</span>`
                                  : '<svg class="w-8 h-8 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
                              }
                            }}
                          />
                        ) : article.imageEmoji ? (
                          <span className="text-3xl">{article.imageEmoji}</span>
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {article.title}
                          </h3>
                          {isWithinLast24Hours(article.createdAt) && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {article.excerpt || article.content?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
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
