import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, ArrowLeft, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Books() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const { data: books = [] } = useQuery({
    queryKey: ['/api/books'],
  });

  const { data: materials = [] } = useQuery({
    queryKey: ['/api/materials/', selectedBookId],
    enabled: !!selectedBookId,
  });

  const selectedBook = books.find((book: any) => book.id === selectedBookId);

  if (selectedBookId && selectedBook) {
    // Show materials for selected book
    const bookMaterials = materials.filter((material: any) => material.bookId === selectedBookId);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedBookId(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedBook.title}
            </CardTitle>
            {selectedBook.description && (
              <p className="text-text-secondary">{selectedBook.description}</p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Materials ({bookMaterials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookMaterials.length > 0 ? (
              <div className="space-y-4">
                {bookMaterials.map((material: any) => (
                  <div
                    key={material.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary mb-2">{material.title}</h4>
                        {material.description && (
                          <p className="text-sm text-text-secondary mb-3">{material.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(material.createdAt), { addSuffix: true })}
                          </span>
                          <span>Type: {material.type}</span>
                          {material.tags && material.tags.length > 0 && (
                            <div className="flex gap-1">
                              {material.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            material.status === 'approved' ? 'default' :
                            material.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {material.status}
                        </Badge>
                        
                        {material.status === 'approved' && material.filePath && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/uploads/${material.filePath}`, '_blank')}
                          >
                            View File
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No materials in this book yet</p>
                <p className="text-sm">Upload materials to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show all books
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Study Books</h2>
        <p className="text-text-secondary">Browse all available books and their materials</p>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book: any) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBookId(book.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {book.title}
                </CardTitle>
                {book.description && (
                  <p className="text-sm text-text-secondary line-clamp-2">{book.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <FileText className="h-4 w-4" />
                    <span>{book.materialCount || 0} materials</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Books Available</h3>
            <p className="text-text-secondary">
              Books will appear here once an administrator creates them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}