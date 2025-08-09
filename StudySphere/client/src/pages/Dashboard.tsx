import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Clock, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const { user } = useAuth();

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['/api/materials/'],
  });

  // Get latest announcements (not dismissed)
  const latestAnnouncements = announcements
    .filter((announcement: any) => !dismissedAnnouncements.includes(announcement.id))
    .slice(0, 3);

  // Get latest materials
  const latestMaterials = materials.slice(0, 5);

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements(prev => [...prev, id]);
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Welcome back, {user?.name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-text-secondary">
          Access your study materials and stay updated with the latest announcements
        </p>
      </div>

      {/* Latest Announcements */}
      {latestAnnouncements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📢</span>
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestAnnouncements.map((announcement: any) => (
              <Alert key={announcement.id} className={getAnnouncementColor(announcement.type)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getAnnouncementIcon(announcement.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{announcement.title}</h4>
                      <AlertDescription className="text-text-secondary mt-1">
                        {announcement.content}
                      </AlertDescription>
                      <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-text-secondary hover:text-text-primary"
                    onClick={() => dismissAnnouncement(announcement.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Latest Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recently Uploaded Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestMaterials.length > 0 ? (
            <div className="space-y-3">
              {latestMaterials.map((material: any) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                      {material.type?.includes('image') ? '🖼️' : 
                       material.type?.includes('pdf') ? '📄' : 
                       material.type?.includes('video') ? '🎥' : '📁'}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{material.title}</h4>
                      <p className="text-sm text-text-secondary">
                        Uploaded {formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">{material.bookTitle}</p>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <span className={`w-2 h-2 rounded-full ${
                        material.status === 'approved' ? 'bg-green-500' :
                        material.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></span>
                      {material.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No materials uploaded yet</p>
              <p className="text-sm">Start by uploading your first study material!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Materials</p>
                <p className="text-2xl font-bold text-text-primary">{materials.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">My Uploads</p>
                <p className="text-2xl font-bold text-text-primary">
                  {materials.filter((m: any) => m.uploadedBy === user?.id).length}
                </p>
              </div>
              <span className="text-2xl">📤</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Announcements</p>
                <p className="text-2xl font-bold text-text-primary">{announcements.length}</p>
              </div>
              <span className="text-2xl">📢</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}