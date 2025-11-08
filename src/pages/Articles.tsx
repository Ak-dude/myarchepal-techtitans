import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Eye, ThumbsUp, MessageSquare, Bookmark, TrendingUp, Filter, Loader2, FileText, Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArticles, useFeaturedArticles, useArticlesByCategory, useArticleSearch } from "@/hooks/use-articles";
import { useAuth } from "@/hooks/use-auth";
import { Timestamp } from "firebase/firestore";

const Articles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Use different hooks based on current state
  const { articles: allArticles, loading: allLoading, error: allError } = useArticles();
  const { articles: featuredArticles } = useFeaturedArticles();
  const { articles: categoryArticles, loading: categoryLoading } = useArticlesByCategory(selectedCategory);
  const { articles: searchResults, loading: searchLoading } = useArticleSearch(searchQuery);

  // Extract unique categories from all articles
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    if (allArticles.length > 0) {
      const uniqueCategories = Array.from(new Set(allArticles.map(article => article.category)));
      setCategories(["All", ...uniqueCategories.sort()]);
    }
  }, [allArticles]);

  // Determine which articles to show
  const getArticlesToShow = () => {
    if (searchQuery.trim()) {
      return searchResults;
    } else if (selectedCategory === "All") {
      return allArticles;
    } else {
      return categoryArticles;
    }
  };

  const articles = getArticlesToShow();
  const loading = searchQuery.trim() ? searchLoading :
                  selectedCategory === "All" ? allLoading : categoryLoading;

  const formatDate = (date: Date | Timestamp | undefined) => {
    if (!date) return "Unknown date";
    const d = date instanceof Timestamp ? date.toDate() : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <PageHeader />
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/create-article")}
                  className="hover:bg-muted mr-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              )}
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, authors..."
              className="pl-10 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="px-4 pt-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-0 bg-transparent border-b rounded-none">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="All" className="mt-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading articles...</span>
                </div>
              ) : allError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">{allError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {!searchQuery && featuredArticles.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-foreground">Featured Articles</h2>
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-3">
                        {featuredArticles.map((article) => (
                          <Card
                            key={article.id}
                            className="p-4 border-primary/20 bg-primary/5 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleArticleClick(article.id!)}
                          >
                            <div className="flex gap-3">
                              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {article.image ? (
                                  <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<span class="text-2xl">${article.imageEmoji || '📄'}</span>`;
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="text-2xl">{article.imageEmoji || '📄'}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {article.category}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Featured
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                                  {article.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={article.authorAvatar} />
                                      <AvatarFallback>{article.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{article.author}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {searchQuery ? `Search Results (${articles.length})` : "Recent Articles"}
                    </h2>
                    {articles.length === 0 ? (
                      <Card className="p-8 text-center border-border">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchQuery ? "No articles found matching your search." : "No articles available yet."}
                        </p>
                      </Card>
                    ) : (
                      articles.map((article) => (
                        <Card
                          key={article.id}
                          className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleArticleClick(article.id!)}
                        >
                          <div className="flex gap-3 mb-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {article.image ? (
                                <img
                                  src={article.image}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-xl">${article.imageEmoji || '📄'}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-xl">{article.imageEmoji || '📄'}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <Badge variant="outline" className="text-xs mb-1">
                                {article.category}
                              </Badge>
                              <h3 className="font-semibold text-foreground line-clamp-2">
                                {article.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.excerpt}
                          </p>

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {article.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                <span>{article.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{article.comments}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(article.publishedAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={article.authorAvatar} />
                              <AvatarFallback>{article.author[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{article.author}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{article.readTime}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>
            {categories.slice(1).map((category) => (
              <TabsContent key={category} value={category} className="mt-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">Loading {category.toLowerCase()} articles...</span>
                  </div>
                ) : articles.length === 0 ? (
                  <Card className="p-8 text-center border-border">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No {category.toLowerCase()} articles available yet.
                    </p>
                  </Card>
                ) : (
                  articles.map((article) => (
                    <Card
                      key={article.id}
                      className="p-4 border-border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleArticleClick(article.id!)}
                    >
                      <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-xl">${article.imageEmoji || '📄'}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xl">{article.imageEmoji || '📄'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{article.likes}</span>
                          </div>
                        </div>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Articles;