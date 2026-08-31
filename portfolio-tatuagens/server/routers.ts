import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createQuoteRequest, listDrawingStatusOverrides, upsertDrawingStatusOverride } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  drawingStatuses: router({
    list: publicProcedure.query(() => listDrawingStatusOverrides()),
    update: adminProcedure
      .input(z.object({
        drawingId: z.string().trim().min(1).max(180),
        status: z.enum(["Disponível", "Reservado", "Indisponível"]),
      }))
      .mutation(({ input, ctx }) => upsertDrawingStatusOverride({ ...input, updatedBy: ctx.user.id })),
  }),

  quotes: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2).max(160),
        email: z.string().email("Digite um e-mail válido.").max(320),
        phone: z.string().trim().min(8, "Digite um telefone com pelo menos 8 números.").max(32),
        placement: z.string().trim().min(2).max(160),
        size: z.string().trim().min(1).max(80),
        idea: z.string().trim().min(10).max(5000),
        preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        references: z.array(z.object({
          name: z.string().trim().min(1).max(160),
          type: z.string().regex(/^image\/(jpeg|png|webp)$/),
          data: z.string().min(32).max(8_000_000),
        })).max(5),
      }))
      .mutation(({ input }) => createQuoteRequest(input)),
  }),
});

export type AppRouter = typeof appRouter;
