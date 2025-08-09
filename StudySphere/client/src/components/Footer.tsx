import { MessageCircle, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-text-secondary">
            <span>Developed with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by Sohaib</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/923476856605"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Contact via WhatsApp</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-xs text-text-secondary">
            For any queries or support, feel free to reach out. We're here to help!
          </p>
        </div>
      </div>
    </footer>
  );
}