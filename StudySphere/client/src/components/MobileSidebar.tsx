import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, BookOpen, Upload, User, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      id: "books",
      label: "Books",
      icon: BookOpen,
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
    },
    ...(user?.role === 'admin' ? [{
      id: "admin",
      label: "Admin Panel",
      icon: User,
    }] : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-primary">LearnBox</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
              <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {user?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={logout}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}