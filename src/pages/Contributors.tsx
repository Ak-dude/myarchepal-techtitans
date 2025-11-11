import { Users, Globe, Mail, Link2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Contributor {
  id: number;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  bio: string;
  specialization?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
}

const contributors: Contributor[] = [
  {
    id: 1,
    name: "Arjun Katta",
    role: "Lead Full-Stack Developer, And administrator of ArchePal",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
    initials: "AK",
    bio: "I Architected and developed the core infrastructure of Archepal. Led the implementation of the site management system, artifact catalog, and real-time collaboration features. Passionate about creating realworld solutions and byrani",
    specialization: "React, Node.js & Firebase, Python ",
    social: {
      github: "https://github.com/Ak-dude",
      linkedin: "https://linkedin.com",
      email: "alex.t@archepal.com"
    }
  },
  {
    id: 2,
    name: "Shreyan Sharma",
    role: "Frontend Developer & Lead UI/UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
    initials: "SS",
    bio: "Built the responsive user interface and interactive components that make Archepal accessible on any device. Specialized in creating smooth animations and optimizing performance for large datasets. Focused on making complex archaeological data easy to explore and understand.",
    specialization: "React & TypeScript",
    social: {
      github: "https://github.com",
      twitter: "https://twitter.com",
      website: "https://example.com"
    }
  },
  {
    id: 3,
    name: "Aarush Mene",
    role: "Boilerplate developer with lovable code",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    initials: "AM",
    bio: "Developed the robust backend API and database architecture that powers Archepal. Implemented secure authentication, data synchronization, and scalable cloud infrastructure using Firebase. Ensures the platform handles growing data while maintaining fast response times.",
    specialization: "UI and UX",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "jordan.l@archepal.com"
    }
  },
  {
    id: 4,
    name: "Sachin Senthil Kumar",
    role: "UI/UX design for reports",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
    initials: "SK",
    bio: "Designed the entire user experience for Archepal, from initial wireframes to the final polished interface. Conducted user research with archaeologists and enthusiasts to ensure the platform meets real-world needs. Created a design system that balances functionality with aesthetic appeal.",
    specialization: "User Experience Design",
    social: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      website: "https://example.com"
    }
  },
  {
    id: 5,
    name: "Anish Rudras",
    role: "N/A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    initials: "",
    bio: "Helped with UI mockup",
    specialization: "UI/UX",
    social: {
      github: "https://github.com/rudras1",
      linkedin: "https://linkedin.com",
      email: "casey.m@archepal.com"
    }
  },
  {
    id: 6,
    name: "Atharav pardeshi",
    role: "Devloper Intern ",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riley",
    initials: "RZ",
    bio: "Optimized Archepal for mobile devices and created Progressive Web App features for offline access. Ensures archaeologists can update field data even in remote locations without internet connectivity. Specialized in creating touch-friendly interfaces for tablets and smartphones.",
    specialization: "Progressive Web Apps",
    social: {
      github: "https://github.com",
      twitter: "https://twitter.com",
      email: "riley.z@archepal.com"
    }
  }
];

const Contributors = () => {
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <header className="bg-card p-4 border-b border-border sticky top-0 z-10">
          <PageHeader />
        </header>

        {/* Hero Section */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Meet Our Developers</h1>
            <p className="text-muted-foreground">
              The talented software engineers who built Archepal from the ground up
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 pb-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{contributors.length}</div>
                  <div className="text-xs text-muted-foreground">Developers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-xs text-muted-foreground">Lines of Code</div>
                </div>
                <div className="text-xs te"></div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contributors List */}
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Development Team</h2>
            <p className="text-sm text-muted-foreground">
              Meet the developers who brought Archepal to life with their technical expertise
            </p>
          </div>

          <div className="space-y-4">
            {contributors.map((contributor) => (
              <Card key={contributor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={contributor.avatar} />
                      <AvatarFallback className="text-lg font-semibold">
                        {contributor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{contributor.name}</CardTitle>
                      <CardDescription className="text-sm">{contributor.role}</CardDescription>
                      {contributor.specialization && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {contributor.specialization}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {contributor.bio}
                  </p>

                  {/* Social Links */}
                  {contributor.social && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      {contributor.social.github && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSocialClick(contributor.social!.github!)}
                          title="GitHub"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      {contributor.social.linkedin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSocialClick(contributor.social!.linkedin!)}
                          title="LinkedIn"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      {contributor.social.twitter && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSocialClick(contributor.social!.twitter!)}
                          title="Twitter"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      {contributor.social.website && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSocialClick(contributor.social!.website!)}
                          title="Website"
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                      {contributor.social.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.location.href = `mailto:${contributor.social!.email}`}
                          title="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Us Section */}
        <div className="px-6 pb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Contact Us</CardTitle>
              <CardDescription>
                Interested in contributing to Archepal? We're always looking for talented developers passionate about technology and cultural heritage.
              </CardDescription>
            </CardHeader>
            <CardContent>
                
              <Button
                className="w-full"
                onClick={() => window.location.href = '/contact'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </Button>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Contributors;
