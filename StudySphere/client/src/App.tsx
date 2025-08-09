import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import Dashboard from "@/pages/Dashboard";
import Books from "@/pages/Books";
import Upload from "@/pages/Upload";
import Login from "@/pages/Login";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex pt-16">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <main className="flex-1 lg:ml-64 p-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "books" && <Books />}
          {activeTab === "upload" && <Upload />}
          {activeTab === "admin" && user?.role === 'admin' && <AdminPanel />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}