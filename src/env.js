import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * `next build` always sets NODE_ENV=production, including Vercel preview.
 * Require Auth.js secrets only on the production deploy (VERCEL_ENV), not on
 * every production-mode build.
 */
const requireAuthSecrets = process.env.VERCEL_ENV === "production";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: requireAuthSecrets ? z.string() : z.string().optional(),
    AUTH_GOOGLE_ID: requireAuthSecrets ? z.string() : z.string().optional(),
    AUTH_GOOGLE_SECRET: requireAuthSecrets
      ? z.string()
      : z.string().optional(),
    /**
     * Stable Auth.js base URL used as OAuth redirect_uri for Preview deploys.
     * Must be set on both Preview and Production (Auth.js proxy). Leave unset locally.
     * @see https://authjs.dev/getting-started/deployment#securing-a-preview-deployment
     */
    AUTH_REDIRECT_PROXY_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    DATABASE_URL_UNPOOLED: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_REDIRECT_PROXY_URL: process.env.AUTH_REDIRECT_PROXY_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
