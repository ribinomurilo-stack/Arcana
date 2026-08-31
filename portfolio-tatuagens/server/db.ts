import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { drawingStatusOverrides, InsertDrawingStatusOverride, InsertQuoteRequest, InsertUser, quoteRequests, users } from "../drizzle/schema";
import { storagePut } from "./storage";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listDrawingStatusOverrides() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(drawingStatusOverrides);
}

export async function upsertDrawingStatusOverride(input: InsertDrawingStatusOverride) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(drawingStatusOverrides).values(input).onDuplicateKeyUpdate({
    set: { status: input.status, updatedBy: input.updatedBy, updatedAt: new Date() },
  });
  return { success: true } as const;
}

export type QuoteReferenceInput = {
  name: string;
  type: string;
  data: string;
};

export async function createQuoteRequest(input: {
  name: string;
  email: string;
  phone: string;
  placement: string;
  size: string;
  idea: string;
  preferredDate: string;
  references: QuoteReferenceInput[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const referenceUrls: string[] = [];
  for (const reference of input.references) {
    const base64 = reference.data.replace(/^data:[^;]+;base64,/, "");
    const safeName = reference.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "reference";
    const upload = await storagePut(`quote-references/${Date.now()}-${safeName}`, Buffer.from(base64, "base64"), reference.type);
    referenceUrls.push(upload.url);
  }

  const values: InsertQuoteRequest = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    placement: input.placement,
    size: input.size,
    idea: input.idea,
    preferredDate: input.preferredDate,
    referenceUrls: JSON.stringify(referenceUrls),
  };
  await db.insert(quoteRequests).values(values);
  return { success: true, referenceUrls } as const;
}
