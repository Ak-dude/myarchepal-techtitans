import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title?: string;
  showLogo?: boolean;
  className?: string;
}

export const PageHeader = ({ title, showLogo = true, className = "" }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLogo && (
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/archepal.png"
            alt="ArchePal Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-semibold text-foreground">ArchePal</span>
        </button>
      )}
      {title && !showLogo && (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      )}
    </div>
  );
};
