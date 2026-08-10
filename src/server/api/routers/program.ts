import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { TRPCContext } from "~/server/api/context";
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
  z.object({
    type: z.literal("song"),
    songId: z.string().nullable(),
    payload: z.object({}).optional().default({}),
  }),
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

function sectionPersistData(
  section: z.infer<typeof sectionInput>,
  position: number,
) {
  return {
    position,
    type: section.type,
    payload: section.payload,
    songId: section.type === "song" ? section.songId : null,
  };
}

async function resolveLiveSong(
  db: TRPCContext["db"],
  songId: string | null,
) {
  if (!songId) return null;
  const song = await db.song.findUnique({
    where: { id: songId },
    include: { chunks: { orderBy: { position: "asc" } } },
  });
  if (!song) return null;
  return {
    id: song.id,
    title: song.title,
    chunks: song.chunks.map((chunk) => ({ text: chunk.text })),
  };
}

async function toPublicProgram(
  db: TRPCContext["db"],
  program: {
    id: string;
    name: string;
    sections: {
      id: string;
      position: number;
      type: string;
      songId: string | null;
      payload: unknown;
    }[];
  },
) {
  const sections = [...program.sections].sort((a, b) => a.position - b.position);
  const resolved = await Promise.all(
    sections.map(async (section) => {
      if (section.type !== "song") {
        return {
          id: section.id,
          position: section.position,
          type: section.type,
          payload: section.payload,
        };
      }
      const song = await resolveLiveSong(db, section.songId);
      return {
        id: section.id,
        position: section.position,
        type: section.type,
        payload: section.payload,
        songId: section.songId,
        song,
      };
    }),
  );

  return {
    id: program.id,
    name: program.name,
    sections: resolved,
    slides: expandSections(
      resolved.map((section) =>
        section.type === "song"
          ? { type: section.type, payload: section.payload, song: section.song }
          : { type: section.type, payload: section.payload },
      ),
    ),
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
            create: input.sections.map((section, position) =>
              sectionPersistData(section, position),
            ),
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
      return toPublicProgram(ctx.db, program);
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
      return toPublicProgram(ctx.db, program);
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
          ...sectionPersistData(section, position),
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
