import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const adminAuthClient = createAuthClient({
  baseURL: (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000") + "/api/admin-auth",
  session: {
    cookiePrefix: "admin-auth",
  },
  plugins: [
    adminClient(),
  ],
});
