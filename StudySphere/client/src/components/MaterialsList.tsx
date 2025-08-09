import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, Image, Video, File } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "./AuthProvider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MaterialsListProps {
  selectedBookId?: string;
  showPendingOnly?: boolean;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
  if (fileType.includes('video')) return <Video className="h-5 w-5 text-green-500" />;
  if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function MaterialsList({ selectedBookId, showPendingOnly }: MaterialsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (selectedBookId) queryParams.append('bookId', selectedBookId);
  if (showPendingOnly) queryParams.append('status', 'pending');
  if (searchQuery) queryParams.append('search', searchQuery);

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['/api/materials', queryParams.toString()],
    refetchInterval: showPendingOnly ? 5000 : false, // Auto-refresh pending materials
  });

  const { data: books = [] } = useQuery({
    queryKey: ['/api/books'],
  });

  // Approve material mutation
  const approveMutation = useMutation({
    mutationFn: async (materialId: string) => {
      return await apiRequest("PUT", `/api/materials/${materialId}`, {
        status: "approved"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({ title: "Material approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve material", variant: "destructive" });
    }
  });

  // Reject material mutation
  const rejectMutation = useMutation({
    mutationFn: async (materialId: string) => {
      return await apiRequest("PUT", `/api/materials/${materialId}`, {
        status: "rejected"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({ title: "Material rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject material", variant: "destructive" });
    }
  });

  // Delete material mutation
  const deleteMutation = useMutation({
    mutationFn: async (materialId: string) => {
      return await apiRequest("DELETE", `/api/materials/${materialId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({ title: "Material deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete material", variant: "destructive" });
    }
  });

  const filteredMaterials = (materials as any[]).filter((material: any) => {
    if (selectedSubject !== "all" && material.book?.id !== selectedSubject) return false;
    return true;
  });

  const downloadFile = (filePath: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = `/uploads/${filePath}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedBookId && !showPendingOnly && (
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {(books as any[]).map((book: any) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-text-secondary">No materials found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material: any) => (
            <Card key={material.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      {getFileIcon(material.fileType)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate">
                      {material.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {material.book?.title} • Uploaded by {material.uploadedBy?.name}
                    </p>
                    {material.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(material.status)}>
                        {material.status}
                      </Badge>
                      {material.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })}
                    </span>
                    <div className="flex space-x-2">
                      {material.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => downloadFile(material.filePath, material.fileName)}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                      )}
                      
                      {user?.role === 'admin' && material.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(material.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(material.id)}
                            disabled={rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {(user?.role === 'admin' || material.uploadedBy?.id === user?.id) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(material.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
