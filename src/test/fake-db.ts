import { randomUUID } from "node:crypto";

import { songMatchesSearch } from "~/server/song-search";

type UserRow = { id: string; isEditor: boolean };

type ArtistRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SongRow = {
  id: string;
  title: string;
  cifra: unknown;
  artistId: string | null;
  videoId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChunkRow = {
  id: string;
  songId: string;
  position: number;
  text: string;
};

type ProgramRow = {
  id: string;
  name: string;
  ownerTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
};

type SectionRow = {
  id: string;
  programId: string;
  position: number;
  type: string;
  songId: string | null;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export class UniqueConstraintError extends Error {
  readonly code = "P2002";
  readonly meta: { target: string[] };

  constructor(target: string[]) {
    super("Unique constraint failed");
    this.name = "UniqueConstraintError";
    this.meta = { target };
  }
}

function now() {
  return new Date();
}

function sortBy<T>(rows: T[], key: keyof T, locale = "pt-BR"): T[] {
  return [...rows].sort((a, b) =>
    String(a[key] ?? "").localeCompare(String(b[key] ?? ""), locale, {
      sensitivity: "base",
    }),
  );
}

export function createFakeDb(opts?: { users?: UserRow[] }) {
  const users = new Map((opts?.users ?? []).map((user) => [user.id, user]));
  const artists = new Map<string, ArtistRow>();
  const songs = new Map<string, SongRow>();
  const chunks = new Map<string, ChunkRow>();
  const programs = new Map<string, ProgramRow>();
  const sections = new Map<string, SectionRow>();

  function artistNameTaken(name: string, exceptId?: string) {
    const needle = name.toLocaleLowerCase("pt-BR");
    for (const artist of artists.values()) {
      if (artist.id === exceptId) continue;
      if (artist.name.toLocaleLowerCase("pt-BR") === needle) return true;
    }
    return false;
  }

  return {
    upsertUser(user: UserRow) {
      users.set(user.id, user);
    },
    searchSongs: async (q: string) => {
      const hits = [...songs.values()].map((song) => {
        const artist = song.artistId
          ? (artists.get(song.artistId) ?? null)
          : null;
        return { song, artist };
      });
      return sortBy(
        hits
          .filter(({ song, artist }) =>
            songMatchesSearch(song.title, artist?.name ?? null, q),
          )
          .map(({ song, artist }) => ({
            id: song.id,
            title: song.title,
            artist: artist ? { id: artist.id, name: artist.name } : null,
          })),
        "title",
      );
    },
    user: {
      findUnique: async ({
        where,
      }: {
        where: { id: string };
        select?: { isEditor: true };
      }) => {
        const user = users.get(where.id);
        return user ? { isEditor: user.isEditor } : null;
      },
    },
    artist: {
      findMany: async () =>
        sortBy([...artists.values()], "name").map(
          ({ id, name, imageUrl }) => ({ id, name, imageUrl }),
        ),
      findUnique: async ({
        where,
        include,
      }: {
        where: { id?: string; name?: string };
        include?: { songs?: boolean | { select?: unknown; orderBy?: unknown } };
      }) => {
        const artist = where.id
          ? (artists.get(where.id) ?? null)
          : ([...artists.values()].find(
              (row) =>
                row.name.toLocaleLowerCase("pt-BR") ===
                where.name?.toLocaleLowerCase("pt-BR"),
            ) ?? null);
        if (!artist) return null;
        if (!include?.songs) return artist;
        const listed = sortBy(
          [...songs.values()].filter((song) => song.artistId === artist.id),
          "title",
        ).map(({ id, title }) => ({ id, title }));
        return { ...artist, songs: listed };
      },
      create: async ({
        data,
      }: {
        data: { name: string; imageUrl?: string | null };
      }) => {
        if (artistNameTaken(data.name)) {
          throw new UniqueConstraintError(["name"]);
        }
        const row: ArtistRow = {
          id: randomUUID(),
          name: data.name,
          imageUrl: data.imageUrl ?? null,
          createdAt: now(),
          updatedAt: now(),
        };
        artists.set(row.id, row);
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { name?: string; imageUrl?: string | null };
      }) => {
        const existing = artists.get(where.id);
        if (!existing) throw new Error("Artist not found");
        if (data.name !== undefined && artistNameTaken(data.name, where.id)) {
          throw new UniqueConstraintError(["name"]);
        }
        const row: ArtistRow = {
          ...existing,
          ...data,
          imageUrl:
            data.imageUrl === undefined ? existing.imageUrl : data.imageUrl,
          updatedAt: now(),
        };
        artists.set(row.id, row);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const existing = artists.get(where.id);
        if (!existing) throw new Error("Artist not found");
        artists.delete(where.id);
        for (const song of songs.values()) {
          if (song.artistId === where.id) {
            song.artistId = null;
            song.updatedAt = now();
          }
        }
        return existing;
      },
    },
    song: {
      findMany: async () =>
        sortBy([...songs.values()], "title").map((song) => ({
          ...song,
          artist: song.artistId ? (artists.get(song.artistId) ?? null) : null,
          chunks: sortBy(
            [...chunks.values()].filter((chunk) => chunk.songId === song.id),
            "position",
          ),
        })),
      findUnique: async ({
        where,
        include,
      }: {
        where: { id: string };
        include?: { artist?: boolean; chunks?: boolean };
      }) => {
        const song = songs.get(where.id);
        if (!song) return null;
        return {
          ...song,
          artist:
            include?.artist && song.artistId
              ? (artists.get(song.artistId) ?? null)
              : include?.artist
                ? null
                : undefined,
          chunks: include?.chunks
            ? sortBy(
                [...chunks.values()].filter(
                  (chunk) => chunk.songId === song.id,
                ),
                "position",
              )
            : undefined,
        };
      },
      create: async ({
        data,
      }: {
        data: {
          title: string;
          cifra: unknown;
          artistId?: string | null;
          videoId?: string | null;
          chunks?: { create: { position: number; text: string }[] };
        };
      }) => {
        const row: SongRow = {
          id: randomUUID(),
          title: data.title,
          cifra: data.cifra,
          artistId: data.artistId ?? null,
          videoId: data.videoId ?? null,
          createdAt: now(),
          updatedAt: now(),
        };
        songs.set(row.id, row);
        for (const chunk of data.chunks?.create ?? []) {
          const chunkRow: ChunkRow = {
            id: randomUUID(),
            songId: row.id,
            position: chunk.position,
            text: chunk.text,
          };
          chunks.set(chunkRow.id, chunkRow);
        }
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: {
          title?: string;
          cifra?: unknown;
          artistId?: string | null;
          videoId?: string | null;
        };
      }) => {
        const existing = songs.get(where.id);
        if (!existing) throw new Error("Song not found");
        const row: SongRow = {
          ...existing,
          ...data,
          artistId:
            data.artistId === undefined ? existing.artistId : data.artistId,
          videoId:
            data.videoId === undefined ? existing.videoId : data.videoId,
          updatedAt: now(),
        };
        songs.set(row.id, row);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const existing = songs.get(where.id);
        if (!existing) throw new Error("Song not found");
        songs.delete(where.id);
        for (const [id, chunk] of chunks) {
          if (chunk.songId === where.id) chunks.delete(id);
        }
        return existing;
      },
    },
    lyricChunk: {
      findMany: async ({ where }: { where: { songId: string } }) =>
        sortBy(
          [...chunks.values()].filter((chunk) => chunk.songId === where.songId),
          "position",
        ),
    },
    program: {
      findUnique: async ({
        where,
        include,
      }: {
        where: { id?: string; ownerTokenHash?: string };
        include?: { sections?: boolean };
      }) => {
        const program = where.id
          ? (programs.get(where.id) ?? null)
          : ([...programs.values()].find(
              (row) => row.ownerTokenHash === where.ownerTokenHash,
            ) ?? null);
        if (!program) return null;
        if (!include?.sections) return program;
        return {
          ...program,
          sections: sortBy(
            [...sections.values()].filter(
              (section) => section.programId === program.id,
            ),
            "position",
          ),
        };
      },
      create: async ({
        data,
      }: {
        data: {
          name: string;
          ownerTokenHash: string;
          sections?: {
            create: {
              position: number;
              type: string;
              songId?: string | null;
              payload?: unknown;
            }[];
          };
        };
      }) => {
        if (
          [...programs.values()].some(
            (row) => row.ownerTokenHash === data.ownerTokenHash,
          )
        ) {
          throw new UniqueConstraintError(["ownerTokenHash"]);
        }
        const row: ProgramRow = {
          id: randomUUID(),
          name: data.name,
          ownerTokenHash: data.ownerTokenHash,
          createdAt: now(),
          updatedAt: now(),
        };
        programs.set(row.id, row);
        for (const section of data.sections?.create ?? []) {
          const sectionRow: SectionRow = {
            id: randomUUID(),
            programId: row.id,
            position: section.position,
            type: section.type,
            songId: section.songId ?? null,
            payload: section.payload ?? {},
            createdAt: now(),
            updatedAt: now(),
          };
          sections.set(sectionRow.id, sectionRow);
        }
        return row;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { name?: string };
      }) => {
        const existing = programs.get(where.id);
        if (!existing) throw new Error("Program not found");
        const row = { ...existing, ...data, updatedAt: now() };
        programs.set(row.id, row);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const existing = programs.get(where.id);
        if (!existing) throw new Error("Program not found");
        programs.delete(where.id);
        for (const [id, section] of sections) {
          if (section.programId === where.id) sections.delete(id);
        }
        return existing;
      },
    },
    section: {
      deleteMany: async ({ where }: { where: { programId: string } }) => {
        let count = 0;
        for (const [id, section] of sections) {
          if (section.programId === where.programId) {
            sections.delete(id);
            count += 1;
          }
        }
        return { count };
      },
      createMany: async ({
        data,
      }: {
        data: {
          programId: string;
          position: number;
          type: string;
          songId?: string | null;
          payload?: unknown;
        }[];
      }) => {
        for (const section of data) {
          const row: SectionRow = {
            id: randomUUID(),
            programId: section.programId,
            position: section.position,
            type: section.type,
            songId: section.songId ?? null,
            payload: section.payload ?? {},
            createdAt: now(),
            updatedAt: now(),
          };
          sections.set(row.id, row);
        }
        return { count: data.length };
      },
    },
  };
}

export type FakeDb = ReturnType<typeof createFakeDb>;
