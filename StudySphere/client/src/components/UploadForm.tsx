import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface UploadFormProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function UploadForm({ isModal = false, onClose, onSuccess }: UploadFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bookId: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books = [] } = useQuery({
    queryKey: ['/api/books'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: data,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({ title: "Material uploaded successfully" });
      resetForm();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", bookId: "", tags: "" });
    setSelectedFile(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.title || !formData.bookId) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('bookId', formData.bookId);
    data.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)));

    uploadMutation.mutate(data);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={isModal ? "max-w-2xl w-full mx-4 max-h-screen overflow-y-auto" : ""}>
      <CardContent className="p-6">
        {isModal && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Upload Material</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter material title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book">Subject/Book *</Label>
              <Select
                value={formData.bookId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bookId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {(books as any[]).map((book: any) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the material..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Add tags separated by commas..."
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <Label>File Upload *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <CloudUpload className="h-6 w-6 text-primary" />
                    <span className="font-medium text-text-primary">{selectedFile.name}</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <>
                  <CloudUpload className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Upload Files
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4"
                    className="hidden"
                    id="file-input"
                  />
                  <Label htmlFor="file-input" asChild>
                    <Button type="button" className="cursor-pointer">
                      Choose Files
                    </Button>
                  </Label>
                  <p className="text-xs text-text-secondary mt-2">
                    Support: PDF, DOC, DOCX, JPG, PNG, MP4 (Max 10MB each)
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose || resetForm}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Material"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
