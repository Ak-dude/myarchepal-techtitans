import { Map, FlaskConical, Users, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useArchaeologist } from "@/hooks/use-archaeologist";

const actions = [
  { icon: Compass, label: "Explore Sites", subtitle: "Browse discoveries", color: "bg-primary", textColor: "text-primary-foreground", path: "/site-lists" },
  { icon: Map, label: "Site Map", subtitle: "View excavation", color: "bg-accent", textColor: "text-accent-foreground", path: "/site-map" },
  { icon: FlaskConical, label: "Analysis", subtitle: "Lab results", color: "bg-secondary", textColor: "text-secondary-foreground", path: "/analysis" },
  { icon: Users, label: "Team", subtitle: "Collaborate", color: "bg-muted", textColor: "text-muted-foreground", path: "/team" },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isArchaeologist } = useArchaeologist();

  // Only show Quick Actions for logged-in archaeologists
  if (!user || !isArchaeologist) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Card 
            key={action.label}
            onClick={() => navigate(action.path)}
            className="p-4 hover:shadow-md transition-all cursor-pointer border-border"
          >
            <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
              <action.icon className={`w-6 h-6 ${action.textColor}`} />
            </div>
            <h4 className="font-semibold text-sm text-foreground mb-0.5">{action.label}</h4>
            <p className="text-xs text-muted-foreground">{action.subtitle}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
