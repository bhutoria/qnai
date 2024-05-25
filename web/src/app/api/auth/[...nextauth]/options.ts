import { UserRole, prisma } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role: UserRole;
      id?: string;
    };
  }
  interface User extends DefaultUser {
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        accessKey: {
          label: "AccessKey",
          type: "password",
          placeholder: "Access Key",
        },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          const user = await prisma.users.findFirst({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }

          const accessToken = await prisma.accessTokens.findFirst({
            where: { userId: user.id, token: credentials.accessKey },
          });

          if (!accessToken) {
            return null;
          }

          return {
            id: user.id,
            role: "ADMIN",
            email: user.email,
            image: user.avatarUrl,
            name: user.name,
          };
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile, user }) {
      if (user.role === "ADMIN") {
        return true;
      }

      if (!profile?.email) {
        throw new Error("No profile");
      }
      const avatarUrl = (profile as any).avatar_url;
      try {
        await prisma.users.upsert({
          where: {
            email: profile.email,
          },
          create: {
            email: profile.email,
            name: profile.name,
            avatarUrl: avatarUrl,
          },
          update: {
            name: profile.name,
            avatarUrl: avatarUrl,
          },
        });
      } catch (e) {
        console.log(e);
        throw new Error("Unable to sign in");
      }
      return true;
    },
    async jwt({ token, profile, user }) {
      if (profile) {
        const user = await prisma.users.findUnique({
          where: {
            email: profile.email,
          },
        });
        if (!user) {
          throw new Error("No user found");
        }
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session }) {
      if (session.user?.email) {
        let role: UserRole;
        try {
          const data = await prisma.users.findUnique({
            where: { email: session.user.email },
          });

          role = data?.role || "USER";
          session.user.id = data?.id;
        } catch (e) {
          console.log(e);
          role = "USER";
        }
        session.user.role = role;
      }

      return session;
    },
  },
  secret: process.env.JWT_SECRET,
};
