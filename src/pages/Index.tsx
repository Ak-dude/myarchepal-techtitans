import { AppHeader } from "@/components/AppHeader";
import { QuickActions } from "@/components/QuickActions";
import { ActiveProject } from "@/components/ActiveProject";
import { RecentFinds } from "@/components/RecentFinds";
import { SiteConditions } from "@/components/SiteConditions";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  // Default coordinates for North Carolina (center of the state)
  // This provides a general location for weather data on the home page
  const defaultLatitude = 35.7596; // North Carolina center
  const defaultLongitude = -79.0193;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <AppHeader />
        <QuickActions />
        <ActiveProject />
        <RecentFinds />
        <SiteConditions latitude={defaultLatitude} longitude={defaultLongitude} />
        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
