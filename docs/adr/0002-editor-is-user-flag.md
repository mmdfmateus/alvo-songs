# Editor is a flag on User

Song/Artist mutate rights are a boolean **`isEditor`** on the Auth.js/Prisma `User` row — not an env email list, not an Editor/Role table. Any Google account may sign in; only `isEditor` may create/edit Songs and Artists. For v1, flip the column in the DB (no promote UI). Privileged procedures (and editor UI) re-check the flag so a demotion applies without waiting for re-login. Non-Editors get the same library experience as anonymous users. Programs stay outside this flag (see ADR 0001).
