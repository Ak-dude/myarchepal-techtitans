import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AppHeader = () => {
  const navigate = useNavigate();

  const handleNotifications = () => {
    toast.info("No new notifications");
  };

  const handleUserProfile = () => {
    navigate("/account");
  };

  return (
    <header className="bg-card p-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-foreground">ArchePal</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNotifications}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={handleUserProfile}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="User profile"
          >
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" />
          <AvatarFallback>DS</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Good morning, Dr. Smith</h2>
          <p className="text-sm text-muted-foreground">Ready for new discoveries?</p>
        </div>
      </div>
    </header>
  );
};
