import { Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import MobileSidebar from "@/components/MobileSidebar";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab = "dashboard", onTabChange = () => {} }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="bg-surface dark:bg-surface border-b border-gray-200 dark:border-gray-800 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Trigger */}
          <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-text-primary">LearnBox</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-text-secondary hover:text-text-primary"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Admin Badge */}
          {user?.role === 'admin' && (
            <div className="hidden sm:block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Admin
            </div>
          )}
        </div>
      </div>
    </header>
  );
}