-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- The User who is already an Editor is the only Admin.
UPDATE "User" SET "isAdmin" = true WHERE "isEditor" = true;
