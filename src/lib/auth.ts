import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { UserModel } from "@/models/User";
import { createLoginSession, getClientIp, getApproxLocation } from "./session-tracker";

let defaultUsersEnsured = false;

// Auto-seed default candidate accounts if missing in User collection
export async function ensureDefaultUsers() {
  if (defaultUsersEnsured) return;
  await connectToDatabase();

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("nbe2026", salt);
  const adminPasswordHash = await bcrypt.hash("admin123", salt);

  const defaultUsers: {
    username: string;
    passwordHash: string;
    name: string;
    role: "admin" | "student";
  }[] = [
    {
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "Exam Administrator",
      role: "admin",
    },
    {
      username: "sunil",
      passwordHash: defaultPasswordHash,
      name: "Sunil Baghel",
      role: "admin",
    },
    {
      username: "karishma",
      passwordHash: defaultPasswordHash,
      name: "Karishma",
      role: "student",
    },
    {
      username: "prachii",
      passwordHash: defaultPasswordHash,
      name: "Prachii",
      role: "student",
    },
    {
      username: "demobot",
      passwordHash: defaultPasswordHash,
      name: "Demo Institute Bot",
      role: "student",
    },
    {
      username: "candidate1",
      passwordHash: defaultPasswordHash,
      name: "Candidate 1",
      role: "student",
    },
    {
      username: "candidate2",
      passwordHash: defaultPasswordHash,
      name: "Candidate 2",
      role: "student",
    },
    {
      username: "test",
      passwordHash: defaultPasswordHash,
      name: "Test User",
      role: "student",
    },
  ];

  for (const u of defaultUsers) {
    const exists = await UserModel.findOne({ username: u.username }).lean();
    if (!exists) {
      await UserModel.create(u);
    }
  }

  defaultUsersEnsured = true;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "nbe_arena_super_secret_jwt_key_2026_nbems_exam_auth_32_chars",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "e.g. sunil" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter both username and password");
        }

        await connectToDatabase();
        await ensureDefaultUsers();

        const cleanUsername = credentials.username.trim().toLowerCase();
        const user = await UserModel.findOne({ username: cleanUsername }).lean();

        if (!user) {
          throw new Error("Invalid username or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid username or password");
        }

        // Extract IP, userAgent, and approxLocation from request headers
        let ipAddress: string | null = null;
        let userAgent: string | null = null;
        let approxLocation: string | null = null;

        try {
          // Dynamic import of next/headers for Next.js App Router
          const { headers } = await import("next/headers");
          const headerList = headers();
          ipAddress = getClientIp(headerList);
          userAgent = headerList.get("user-agent");
          approxLocation = getApproxLocation(headerList, ipAddress);
        } catch {
          // Fallback to req headers if next/headers is not accessible in context
          if (req?.headers) {
            ipAddress = getClientIp(req.headers);
            const rawUa = (req.headers as any)["user-agent"] || (req.headers as any).get?.("user-agent");
            userAgent = typeof rawUa === "string" ? rawUa : null;
            approxLocation = getApproxLocation(req.headers, ipAddress);
          }
        }

        // Create persistent LoginSession in MongoDB Atlas
        let sessionId = "";
        try {
          sessionId = await createLoginSession({
            userId: user._id,
            username: user.username,
            ipAddress,
            userAgent,
            approxLocation,
            initialPage: "/dashboard",
          });
        } catch (err) {
          console.error("Failed to create login session record:", err);
        }

        return {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: user.role,
          sessionId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as unknown as { username: string }).username;
        token.role = (user as unknown as { role: string }).role;
        token.sessionId = (user as unknown as { sessionId: string }).sessionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { username: string }).username = token.username as string;
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { sessionId: string }).sessionId = token.sessionId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs e.g. "/login"
      if (url.startsWith("/")) return url;
      // Allows callback URLs on the same origin
      try {
        const u = new URL(url);
        const b = new URL(baseUrl);
        if (u.origin === b.origin) return url;
      } catch {}
      return "/login";
    },
  },
};
