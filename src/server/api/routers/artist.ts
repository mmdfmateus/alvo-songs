import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  editorProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { isUniqueConstraintError } from "~/server/db/unique-constraint";

const artistInput = z.object({
  name: z.string().trim().min(1),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

function throwDuplicateName(error: unknown): never {
  if (isUniqueConstraintError(error)) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Já existe um Artista com esse nome.",
    });
  }
  throw error;
}

export const artistRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.artist.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, imageUrl: true },
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.artist.findUnique({
        where: { id: input.id },
        include: {
          songs: {
            select: { id: true, title: true },
            orderBy: { title: "asc" },
          },
        },
      });
    }),

  create: editorProcedure.input(artistInput).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.db.artist.create({
        data: { name: input.name, imageUrl: input.imageUrl },
      });
    } catch (error) {
      throwDuplicateName(error);
    }
  }),

  update: editorProcedure
    .input(artistInput.extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.artist.update({
          where: { id: input.id },
          data: { name: input.name, imageUrl: input.imageUrl },
        });
      } catch (error) {
        throwDuplicateName(error);
      }
    }),

  delete: editorProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.artist.delete({ where: { id: input.id } });
    }),
});
