import { AppHeader } from "@/components/AppHeader";
import { QuickActions } from "@/components/QuickActions";
import { ActiveProject } from "@/components/ActiveProject";
import { RecentFinds } from "@/components/RecentFinds";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <AppHeader />
        <QuickActions />
        <ActiveProject />
        <RecentFinds />
        <BottomNav />
      </div>
    </div>
  );
};

export default Index;
