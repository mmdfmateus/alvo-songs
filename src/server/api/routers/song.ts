import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  editorProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cifraToCow, parseCifra } from "~/lib/cifra-parse";
import { deriveLetra, isCifra, seedLyricChunks } from "~/lib/cifra";

const songInput = z.object({
  title: z.string().trim().min(1),
  cifraText: z.string().min(1),
  artistId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

function parseOrThrow(cifraText: string) {
  try {
    return parseCifra(cifraText);
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Não foi possível ler a Cifra. Cole no formato acordes acima da letra.",
    });
  }
}

export const songRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.song.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        artist: { select: { id: true, name: true } },
      },
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const song = await ctx.db.song.findUnique({
        where: { id: input.id },
        include: {
          artist: true,
          chunks: { orderBy: { position: "asc" } },
        },
      });
      if (!song) return null;

      return {
        id: song.id,
        title: song.title,
        artist: song.artist
          ? {
              id: song.artist.id,
              name: song.artist.name,
              imageUrl: song.artist.imageUrl,
            }
          : null,
        cifra: song.cifra,
        cifraText: cifraToCow(song.cifra),
        letra: deriveLetra(song.cifra),
        chunks: song.chunks.map((chunk) => ({
          id: chunk.id,
          position: chunk.position,
          text: chunk.text,
        })),
      };
    }),

  create: editorProcedure.input(songInput).mutation(async ({ ctx, input }) => {
    const cifra = parseOrThrow(input.cifraText);
    if (!isCifra(cifra)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cifra inválida." });
    }

    const chunks = seedLyricChunks(deriveLetra(cifra));

    return ctx.db.song.create({
      data: {
        title: input.title,
        cifra,
        artistId: input.artistId,
        chunks: {
          create: chunks.map((text, position) => ({ position, text })),
        },
      },
    });
  }),

  update: editorProcedure
    .input(
      songInput.extend({
        id: z.string().min(1),
        chunks: z.array(z.object({ text: z.string() })).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cifra = parseOrThrow(input.cifraText);

      return ctx.db.$transaction(async (tx) => {
        if (input.chunks !== undefined) {
          await tx.lyricChunk.deleteMany({ where: { songId: input.id } });
          await tx.lyricChunk.createMany({
            data: input.chunks.map((chunk, position) => ({
              songId: input.id,
              position,
              text: chunk.text,
            })),
          });
        }

        return tx.song.update({
          where: { id: input.id },
          data: {
            title: input.title,
            cifra,
            artistId: input.artistId,
          },
        });
      });
    }),

  delete: editorProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.song.delete({ where: { id: input.id } });
    }),
});
