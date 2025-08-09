import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState<'book' | 'announcement'>('book');
  
  const { toast } = useToast();

  // Fetch data
  const { data: materials = [] } = useQuery({ queryKey: ['/api/materials/'] });
  const { data: books = [] } = useQuery({ queryKey: ['/api/books'] });
  const { data: announcements = [] } = useQuery({ queryKey: ['/api/announcements'] });
  const { data: users = [] } = useQuery({ queryKey: ['/api/users'] });
  const { data: bookRequests = [] } = useQuery({ queryKey: ['/api/book-requests'] });

  // Mutations
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/materials/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials/'] });
      toast({ title: "Material updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      await apiRequest("DELETE", `/api/${type}/${id}`);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      toast({ title: `${type.slice(0, -1)} deleted successfully` });
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      const response = await apiRequest("POST", `/api/${type}`, data);
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      setShowCreateDialog(false);
      toast({ title: `${type.slice(0, -1)} created successfully` });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/${type}/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      setEditingItem(null);
      toast({ title: `${type.slice(0, -1)} updated successfully` });
    },
  });

  // Statistics
  const stats = {
    totalUsers: users.length,
    activeStudents: users.filter(u => u.role === 'student').length,
    totalBooks: books.length,
    totalMaterials: materials.length,
    pendingMaterials: materials.filter(m => m.status === 'pending').length,
    approvedMaterials: materials.filter(m => m.status === 'approved').length,
    rejectedMaterials: materials.filter(m => m.status === 'rejected').length,
    totalAnnouncements: announcements.length,
    pendingBookRequests: bookRequests.filter(r => r.status === 'pending').length,
  };

  const CreateDialog = ({ type }: { type: 'book' | 'announcement' }) => {
    const [formData, setFormData] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createMutation.mutate({ type: type === 'book' ? 'books' : 'announcements', data: formData });
    };

    return (
      <Dialog open={showCreateDialog && createType === type} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) setFormData({});
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New {type === 'book' ? 'Book' : 'Announcement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            {type === 'book' ? (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type || 'info'} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditDialog = ({ item, type }: { item: any; type: string }) => {
    const [formData, setFormData] = useState(item || {});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateMutation.mutate({ type, id: item.id, data: formData });
    };

    return (
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {type.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            {type === 'books' ? (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            ) : type === 'announcements' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type || 'info'} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}
            
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Admin Dashboard</h2>
        <p className="text-text-secondary">Manage users, books, materials, and announcements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Users</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Books</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalBooks}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Total Materials</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalMaterials}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Pending Reviews</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.pendingMaterials}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Approved
                    </span>
                    <Badge variant="default">{stats.approvedMaterials}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Pending
                    </span>
                    <Badge variant="secondary">{stats.pendingMaterials}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Rejected
                    </span>
                    <Badge variant="destructive">{stats.rejectedMaterials}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => { setCreateType('book'); setShowCreateDialog(true); }}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Book
                </Button>
                <Button 
                  onClick={() => { setCreateType('announcement'); setShowCreateDialog(true); }}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Material Management</h3>
            <Badge variant="secondary">{stats.pendingMaterials} Pending Review</Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {materials.map((material: any) => (
                  <div key={material.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{material.title}</h4>
                        <p className="text-sm text-text-secondary">{material.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                          <span>Uploaded {formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })}</span>
                          <span>Book: {material.bookTitle}</span>
                          <span>Type: {material.type}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            material.status === 'approved' ? 'default' :
                            material.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {material.status}
                        </Badge>
                        
                        {material.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateMaterialMutation.mutate({ id: material.id, status: 'approved' })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateMaterialMutation.mutate({ id: material.id, status: 'rejected' })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {material.filePath && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/uploads/${material.filePath}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Material</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{material.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ type: 'materials', id: material.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Book Management</h3>
            <Button onClick={() => { setCreateType('book'); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book: any) => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{book.title}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(book)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Book</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{book.title}"? This will also delete all materials in this book.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate({ type: 'books', id: book.id })}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary mb-3">{book.description}</p>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{book.materialCount || 0} materials</span>
                    <span>Created {formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Announcement Management</h3>
            <Button onClick={() => { setCreateType('announcement'); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {announcements.map((announcement: any) => (
                  <div key={announcement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-text-primary">{announcement.title}</h4>
                          <Badge variant={
                            announcement.type === 'error' ? 'destructive' :
                            announcement.type === 'warning' ? 'secondary' :
                            announcement.type === 'success' ? 'default' : 'outline'
                          }>
                            {announcement.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{announcement.content}</p>
                        <p className="text-xs text-text-secondary">
                          Created {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(announcement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{announcement.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ type: 'announcements', id: announcement.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">User Management</h3>
            <Badge variant="outline">{stats.activeStudents} Active Students</Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {users.map((user: any) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-text-primary">{user.name || user.email?.split('@')[0]}</h4>
                          <p className="text-sm text-text-secondary">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <span className="text-xs text-text-secondary">
                              Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-text-secondary">
                          {materials.filter(m => m.uploadedBy === user.id).length} uploads
                        </p>
                        <p className="text-xs text-text-secondary">
                          Last active: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Book Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Book Requests</h3>
            <Badge variant="secondary">{stats.pendingBookRequests} Pending</Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {bookRequests.map((request: any) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{request.title}</h4>
                        <p className="text-sm text-text-secondary mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                          <span>Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                          <span>By: {users.find(u => u.id === request.requestedBy)?.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                // Create book from request
                                createMutation.mutate({
                                  type: 'books',
                                  data: { title: request.title, description: request.description }
                                });
                                // Update request status to approved
                                updateMutation.mutate({
                                  type: 'book-requests',
                                  id: request.id,
                                  data: { status: 'approved' }
                                });
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateMutation.mutate({
                                type: 'book-requests',
                                id: request.id,
                                data: { status: 'rejected' }
                              })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialogs */}
      <CreateDialog type="book" />
      <CreateDialog type="announcement" />

      {/* Edit Dialog */}
      {editingItem && (
        <EditDialog 
          item={editingItem} 
          type={editingItem.content ? 'announcements' : 'books'} 
        />
      )}
    </div>
  );
}