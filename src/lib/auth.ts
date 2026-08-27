import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { UserModel } from "@/models/User";

// Auto-seed default candidate accounts if User collection is empty
export async function ensureDefaultUsers() {
  await connectToDatabase();
  const userCount = await UserModel.countDocuments();

  if (userCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash("nbe2026", salt);
    const adminPasswordHash = await bcrypt.hash("admin123", salt);

    const defaultUsers = [
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
    ];

    await UserModel.insertMany(defaultUsers);
    console.log("Initialized default candidate accounts in MongoDB Atlas.");
  }
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
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter both username and password");
        }

        await connectToDatabase();
        await ensureDefaultUsers();

        const cleanUsername = credentials.username.trim().toLowerCase();
        const user = await UserModel.findOne({ username: cleanUsername });

        if (!user) {
          throw new Error("Invalid username or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid username or password");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: user.role,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { username: string }).username = token.username as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
};
