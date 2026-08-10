import { PrismaClient } from "@prisma/client";

import {
  importLivrinho,
  readLivrinhoMarkdown,
  unsyncedLivrinhoSongs,
} from "../src/lib/livrinho-import";

const db = new PrismaClient();

async function main() {
  const imported = importLivrinho(readLivrinhoMarkdown());
  const existing = await db.song.findMany({ select: { title: true } });
  const toInsert = unsyncedLivrinhoSongs(
    imported,
    existing.map((song) => song.title),
  );

  for (const song of toInsert) {
    await db.song.create({
      data: {
        title: song.title,
        cifra: song.cifra,
        chunks: {
          create: song.chunks.map((text, position) => ({ position, text })),
        },
      },
    });
  }

  const flagged = imported.filter((song) => song.flags.length > 0).length;
  console.log(
    `Livrinho seed: ${toInsert.length} inserted, ${imported.length - toInsert.length} already present, ${flagged} flagged for Biblioteca review.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
