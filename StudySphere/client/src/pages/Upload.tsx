import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, X, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/components/AuthProvider";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showBookRequest, setShowBookRequest] = useState(false);
  const [bookRequestTitle, setBookRequestTitle] = useState("");
  const [bookRequestDescription, setBookRequestDescription] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();

  const { data: books = [] } = useQuery({
    queryKey: ['/api/books'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/materials/upload", data, false);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your material has been uploaded and is pending approval.",
      });
      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setSelectedBookId("");
      setTags([]);
      queryClient.invalidateQueries({ queryKey: ['/api/materials/'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file.",
        variant: "destructive",
      });
    },
  });

  const bookRequestMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const response = await apiRequest("POST", "/api/book-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Book request sent",
        description: "Your request for a new book has been sent to the admin.",
      });
      setBookRequestTitle("");
      setBookRequestDescription("");
      setShowBookRequest(false);
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "There was an error sending your request.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, Word document, image, or MP4 video.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.')[0]);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !title || !selectedBookId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('bookId', selectedBookId);
    formData.append('tags', JSON.stringify(tags));

    uploadMutation.mutate(formData);
  };

  const handleBookRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookRequestTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the book request.",
        variant: "destructive",
      });
      return;
    }

    bookRequestMutation.mutate({
      title: bookRequestTitle,
      description: bookRequestDescription,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Upload Study Material</h2>
        <p className="text-text-secondary">
          Share your study materials with the community. All uploads require admin approval.
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Material</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Selection */}
            <div className="space-y-2">
              <Label htmlFor="file">Select File *</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <UploadIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {selectedFile ? (
                    <div>
                      <p className="text-text-primary font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-text-secondary">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-text-primary">Click to select a file</p>
                      <p className="text-sm text-text-secondary">
                        PDF, Word, Images, or MP4 videos (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter material title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the material content"
                rows={3}
              />
            </div>

            {/* Book Selection */}
            <div className="space-y-2">
              <Label>Select Book *</Label>
              {books.length > 0 ? (
                <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book: any) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">No books available</span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Request a new book to be created before uploading materials.
                  </p>
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBookRequest(!showBookRequest)}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request New Book
              </Button>
            </div>

            {/* Book Request Form */}
            {showBookRequest && (
              <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Request New Book</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookTitle">Book Title *</Label>
                      <Input
                        id="bookTitle"
                        value={bookRequestTitle}
                        onChange={(e) => setBookRequestTitle(e.target.value)}
                        placeholder="Enter book title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookDescription">Book Description</Label>
                      <Textarea
                        id="bookDescription"
                        value={bookRequestDescription}
                        onChange={(e) => setBookRequestDescription(e.target.value)}
                        placeholder="Describe what this book will contain"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={bookRequestMutation.isPending}
                      >
                        {bookRequestMutation.isPending ? "Sending..." : "Send Request"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBookRequest(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={uploadMutation.isPending || !selectedFile || !title || !selectedBookId}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}