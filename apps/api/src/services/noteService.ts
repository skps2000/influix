import prisma from '../lib/prisma';
import type { Note, NoteCreateInput, NoteUpdateInput } from '@influix/types';

/**
 * Note Service - Business logic for notes (thinking layer)
 * Connected to Supabase PostgreSQL via Prisma
 * 
 * Notes are designed as a thinking extension, not a memo app.
 * They connect user thinking to AI insights.
 */

interface ListOptions {
  userId: string;
  workspaceId?: string;
  page: number;
  pageSize: number;
  search?: string;
  tags?: string[];
  isArchived?: boolean;
}

export const noteService = {
  async create(input: NoteCreateInput & { createdBy: string; workspaceId: string }): Promise<Note> {
    const note = await prisma.note.create({
      data: {
        workspaceId: input.workspaceId,
        createdById: input.createdBy,
        title: input.title,
        content: input.content,
        contentId: input.contentId,
        insightId: input.insightId,
        tags: input.tags || [],
        isArchived: false,
      },
    });

    return mapPrismaNoteToNote(note);
  },

  async findById(id: string): Promise<Note | null> {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) return null;
    return mapPrismaNoteToNote(note);
  },

  async list(options: ListOptions) {
    const { userId, workspaceId, page, pageSize, search, tags, isArchived } = options;

    const where: any = {
      createdById: userId,
    };

    if (workspaceId) where.workspaceId = workspaceId;
    if (isArchived !== undefined) where.isArchived = isArchived;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [items, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.note.count({ where }),
    ]);

    return {
      data: items.map(mapPrismaNoteToNote),
      total,
      page,
      pageSize,
      hasMore: (page - 1) * pageSize + items.length < total,
    };
  },

  async update(id: string, input: NoteUpdateInput): Promise<Note | null> {
    const note = await prisma.note.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        tags: input.tags,
        isArchived: input.isArchived,
      },
    });

    return mapPrismaNoteToNote(note);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.note.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  async archive(id: string): Promise<Note | null> {
    return this.update(id, { isArchived: true });
  },

  async unarchive(id: string): Promise<Note | null> {
    return this.update(id, { isArchived: false });
  },
};

// Helper function
function mapPrismaNoteToNote(note: any): Note {
  return {
    id: note.id,
    workspaceId: note.workspaceId,
    createdBy: note.createdById,
    title: note.title,
    content: note.content,
    contentId: note.contentId || undefined,
    insightId: note.insightId || undefined,
    tags: note.tags,
    isArchived: note.isArchived,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
