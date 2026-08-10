import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createOwnerToken, hashOwnerToken } from "~/lib/program-owner";
import { expandSections } from "~/lib/slides";

const openingPayload = z.object({
  communityName: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
});

const titledPayload = z.object({
  title: z.string().trim().min(1),
});

const sectionInput = z.discriminatedUnion("type", [
  z.object({ type: z.literal("opening"), payload: openingPayload }),
  z.object({ type: z.literal("announcements"), payload: titledPayload }),
  z.object({ type: z.literal("game"), payload: titledPayload }),
  z.object({ type: z.literal("moment"), payload: titledPayload }),
]);

const sectionsInput = z.array(sectionInput);

function assertOwner(ownerTokenHash: string, ownerToken: string) {
  if (hashOwnerToken(ownerToken) !== ownerTokenHash) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Só o navegador que criou estes Slides pode editar.",
    });
  }
}

function toPublicProgram(program: {
  id: string;
  name: string;
  sections: {
    id: string;
    position: number;
    type: string;
    songId: string | null;
    payload: unknown;
  }[];
}) {
  const sections = [...program.sections].sort((a, b) => a.position - b.position);
  return {
    id: program.id,
    name: program.name,
    sections: sections.map((section) => ({
      id: section.id,
      position: section.position,
      type: section.type,
      payload: section.payload,
    })),
    slides: expandSections(sections),
  };
}

export const programRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
        sections: sectionsInput.default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ownerToken = createOwnerToken();
      const program = await ctx.db.program.create({
        data: {
          name: input.name,
          ownerTokenHash: hashOwnerToken(ownerToken),
          sections: {
            create: input.sections.map((section, position) => ({
              position,
              type: section.type,
              payload: section.payload,
            })),
          },
        },
      });

      return { id: program.id, name: program.name, ownerToken };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.program.findUnique({
        where: { id: input.id },
        include: { sections: { orderBy: { position: "asc" } } },
      });
      if (!program) return null;
      return toPublicProgram(program);
    }),

  forEdit: publicProcedure
    .input(z.object({ id: z.string().min(1), ownerToken: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.program.findUnique({
        where: { id: input.id },
        include: { sections: { orderBy: { position: "asc" } } },
      });
      if (!program) return null;
      if (hashOwnerToken(input.ownerToken) !== program.ownerTokenHash) {
        return null;
      }
      return toPublicProgram(program);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        ownerToken: z.string().min(1),
        name: z.string().trim().min(1),
        sections: sectionsInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.program.findUnique({
        where: { id: input.id },
      });
      if (!program) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Slides não encontrados." });
      }
      assertOwner(program.ownerTokenHash, input.ownerToken);

      await ctx.db.section.deleteMany({ where: { programId: input.id } });
      await ctx.db.section.createMany({
        data: input.sections.map((section, position) => ({
          programId: input.id,
          position,
          type: section.type,
          payload: section.payload,
        })),
      });

      return ctx.db.program.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1), ownerToken: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.program.findUnique({
        where: { id: input.id },
      });
      if (!program) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Slides não encontrados." });
      }
      assertOwner(program.ownerTokenHash, input.ownerToken);
      return ctx.db.program.delete({ where: { id: input.id } });
    }),
});
