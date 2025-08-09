import { users, books, materials, announcements, type User, type InsertUser, type Book, type InsertBook, type Material, type InsertMaterial, type Announcement, type InsertAnnouncement } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<void>;
  getUsers(): Promise<User[]>;

  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;

  // Materials
  getMaterials(bookId?: string, status?: string): Promise<(Material & { uploadedBy: User; book: Book })[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: string, material: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: string): Promise<void>;
  searchMaterials(query: string): Promise<(Material & { uploadedBy: User; book: Book })[]>;
  getMaterialStats(): Promise<{ total: number; byBook: { bookId: string; title: string; count: number }[] }>;

  // Announcements
  getAnnouncements(): Promise<(Announcement & { createdBy: User })[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: string, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db.update(books).set(book).where(eq(books.id, id)).returning();
    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Materials
  async getMaterials(bookId?: string, status?: string): Promise<(Material & { uploadedBy: User; book: Book })[]> {
    let whereConditions = [];
    
    if (bookId) {
      whereConditions.push(eq(materials.bookId, bookId));
    }
    if (status) {
      whereConditions.push(eq(materials.status, status));
    }

    const query = db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        fileName: materials.fileName,
        filePath: materials.filePath,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        tags: materials.tags,
        bookId: materials.bookId,
        uploadedBy: materials.uploadedBy,
        status: materials.status,
        approvedBy: materials.approvedBy,
        createdAt: materials.createdAt,
        updatedAt: materials.updatedAt,
        uploadedByUser: users,
        book: books,
      })
      .from(materials)
      .leftJoin(users, eq(materials.uploadedBy, users.id))
      .leftJoin(books, eq(materials.bookId, books.id))
      .orderBy(desc(materials.createdAt));

    const result = whereConditions.length > 0 
      ? await query.where(and(...whereConditions))
      : await query;

    return result.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      fileName: row.fileName,
      filePath: row.filePath,
      fileSize: row.fileSize,
      fileType: row.fileType,
      tags: row.tags,
      bookId: row.bookId,
      uploadedBy: row.uploadedByUser || { id: '', email: '', name: 'Unknown', avatar: null, role: 'student', isActive: true, createdAt: new Date() },
      status: row.status,
      approvedBy: row.approvedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      book: row.book || { id: '', title: 'Unknown', description: null, coverImage: null, createdBy: '', createdAt: new Date() }
    })) as (Material & { uploadedBy: User; book: Book })[];
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [newMaterial] = await db.insert(materials).values(material).returning();
    return newMaterial;
  }

  async updateMaterial(id: string, material: Partial<InsertMaterial>): Promise<Material> {
    const [updatedMaterial] = await db.update(materials).set({
      ...material,
      updatedAt: new Date(),
    }).where(eq(materials.id, id)).returning();
    return updatedMaterial;
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async searchMaterials(searchQuery: string): Promise<(Material & { uploadedBy: User; book: Book })[]> {
    const result = await db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        fileName: materials.fileName,
        filePath: materials.filePath,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        tags: materials.tags,
        bookId: materials.bookId,
        uploadedBy: materials.uploadedBy,
        status: materials.status,
        approvedBy: materials.approvedBy,
        createdAt: materials.createdAt,
        updatedAt: materials.updatedAt,
        uploadedByUser: users,
        book: books,
      })
      .from(materials)
      .leftJoin(users, eq(materials.uploadedBy, users.id))
      .leftJoin(books, eq(materials.bookId, books.id))
      .where(
        or(
          ilike(materials.title, `%${searchQuery}%`),
          ilike(materials.description, `%${searchQuery}%`),
          ilike(books.title, `%${searchQuery}%`)
        )
      )
      .orderBy(desc(materials.createdAt));

    return result.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      fileName: row.fileName,
      filePath: row.filePath,
      fileSize: row.fileSize,
      fileType: row.fileType,
      tags: row.tags,
      bookId: row.bookId,
      uploadedBy: row.uploadedByUser || { id: '', email: '', name: 'Unknown', avatar: null, role: 'student', isActive: true, createdAt: new Date() },
      status: row.status,
      approvedBy: row.approvedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      book: row.book || { id: '', title: 'Unknown', description: null, coverImage: null, createdBy: '', createdAt: new Date() }
    })) as (Material & { uploadedBy: User; book: Book })[];
  }

  async getMaterialStats(): Promise<{ total: number; byBook: { bookId: string; title: string; count: number }[] }> {
    const totalResult = await db.select({ count: count() }).from(materials);
    const total = totalResult[0]?.count || 0;

    const byBook = await db
      .select({
        bookId: books.id,
        title: books.title,
        count: count(materials.id),
      })
      .from(books)
      .leftJoin(materials, eq(books.id, materials.bookId))
      .groupBy(books.id, books.title)
      .orderBy(desc(count(materials.id)));

    return { total, byBook };
  }

  // Announcements
  async getAnnouncements(): Promise<(Announcement & { createdBy: User })[]> {
    const result = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        createdBy: announcements.createdBy,
        isActive: announcements.isActive,
        createdAt: announcements.createdAt,
        createdByUser: users,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdBy, users.id))
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.createdAt));

    return result.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      type: row.type,
      createdBy: row.createdByUser || { id: '', email: '', name: 'Unknown', avatar: null, role: 'admin', isActive: true, createdAt: new Date() },
      isActive: row.isActive,
      createdAt: row.createdAt,
    })) as (Announcement & { createdBy: User })[];
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db.update(announcements).set(announcement).where(eq(announcements.id, id)).returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.update(announcements).set({ isActive: false }).where(eq(announcements.id, id));
  }
}

// Extend DatabaseStorage with additional methods for admin panel
class ExtendedDatabaseStorage extends DatabaseStorage {
  // Book request methods (using in-memory storage since not in schema yet)
  private bookRequests: any[] = [];

  async createBookRequest(data: any): Promise<any> {
    const request = {
      id: nanoid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.bookRequests.push(request);
    return request;
  }

  async getBookRequests(): Promise<any[]> {
    return this.bookRequests;
  }

  async updateBookRequest(id: string, data: any): Promise<any> {
    const index = this.bookRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.bookRequests[index] = { ...this.bookRequests[index], ...data };
      return this.bookRequests[index];
    }
    throw new Error("Book request not found");
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
    // Materials will cascade delete if foreign key constraints are set up
  }

  async deleteMaterial(id: string): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }
}

export const storage = new ExtendedDatabaseStorage();
