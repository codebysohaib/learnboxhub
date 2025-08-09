import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface BookCardProps {
  book: Book;
  materialCount: number;
  onViewMaterials: (bookId: string) => void;
}

const bookImages = {
  "Mathematics": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
  "Physics": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
  "Chemistry": "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
  "Biology": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
  "default": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
};

export default function BookCard({ book, materialCount, onViewMaterials }: BookCardProps) {
  const imageUrl = book.coverImage || bookImages[book.title as keyof typeof bookImages] || bookImages.default;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <img 
        src={imageUrl} 
        alt={`${book.title} cover`}
        className="w-full h-32 object-cover"
      />
      <CardContent className="p-4">
        <h3 className="font-semibold text-text-primary mb-2">{book.title}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {book.description || "Study materials and resources"}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">
            {materialCount} Materials
          </span>
          <span className="text-sm text-secondary">
            Updated {formatDistanceToNow(new Date(book.createdAt), { addSuffix: true })}
          </span>
        </div>
        <Button 
          onClick={() => onViewMaterials(book.id)}
          className="w-full bg-primary text-white hover:bg-primary/90"
        >
          View Materials
        </Button>
      </CardContent>
    </Card>
  );
}
