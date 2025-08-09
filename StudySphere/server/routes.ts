import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertMaterialSchema, insertAnnouncementSchema } from "@shared/schema";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, uploadsDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Simple session middleware (in production, use proper session management)
  app.use((req: any, res, next) => {
    // For demo purposes, we'll simulate authentication
    // In real implementation, decode JWT or check session
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Decode token and set user (simplified for demo)
      req.user = { id: token, role: 'admin' }; // This should be proper JWT decoding
    }
    next();
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add some basic auth check for file access
    next();
  }, (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, name, avatar, isAdmin } = req.body;
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Set role based on admin email check
        const role = isAdmin ? 'admin' : 'student';
        user = await storage.createUser({ email, name, avatar, role });
      } else if (isAdmin && user.role !== 'admin') {
        // Update existing user to admin if they're the admin email
        await storage.updateUserRole(user.id, 'admin');
        user = await storage.getUser(user.id);
      }
      
      // In real implementation, create and return JWT token
      const token = user.id; // Simplified token
      
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Books routes
  app.get('/api/books', async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.post('/api/books', requireAdmin, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  app.put('/api/books/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: "Failed to update book" });
    }
  });

  app.delete('/api/books/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBook(id);
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Materials routes
  app.get('/api/materials', async (req, res) => {
    try {
      const { bookId, status, search } = req.query;
      
      let materials;
      if (search) {
        materials = await storage.searchMaterials(search as string);
      } else {
        materials = await storage.getMaterials(
          bookId as string,
          status as string
        );
      }
      
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post('/api/materials', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const materialData = {
        title: req.body.title,
        description: req.body.description,
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        bookId: req.body.bookId,
        uploadedBy: req.user.id,
        status: 'pending'
      };

      const parsedData = insertMaterialSchema.parse(materialData);
      const material = await storage.createMaterial(parsedData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: "Failed to upload material" });
    }
  });

  app.put('/api/materials/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const materialData = insertMaterialSchema.partial().parse({
        ...req.body,
        approvedBy: req.user.role === 'admin' ? req.user.id : undefined
      });
      const material = await storage.updateMaterial(id, materialData);
      res.json(material);
    } catch (error) {
      res.status(400).json({ message: "Failed to update material" });
    }
  });

  app.delete('/api/materials/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }

      // Only admin or uploader can delete
      if (req.user.role !== 'admin' && material.uploadedBy !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this material" });
      }

      // Delete file from filesystem
      const filePath = path.join(uploadsDir, material.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await storage.deleteMaterial(id);
      res.json({ message: "Material deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  app.get('/api/materials/stats', async (req, res) => {
    try {
      const stats = await storage.getMaterialStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch material stats" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', requireAdmin, async (req: any, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const announcement = await storage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const announcementData = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(id, announcementData);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnnouncement(id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Users routes (admin only)
  app.get('/api/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id/role', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      await storage.updateUserRole(id, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
