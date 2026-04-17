import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Invalid credentials");
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) throw new Error("Invalid email or password");
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Invalid email or password");
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          designation: user.designation,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("SignIn Callback - Provider:", account?.provider);
      console.log("SignIn Callback - Email:", user.email);
      
      if (account?.provider === "google") {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        
        console.log("SignIn Callback - User found in DB:", existingUser ? "Yes" : "No");
        
        if (!existingUser) {
          console.log("SignIn Callback - Access Denied for:", user.email);
          return "/login?error=AccessDenied";
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          token.employeeId = dbUser.employeeId;
          token.department = dbUser.department;
          token.designation = dbUser.designation;
          token.avatar = dbUser.avatar || user.image;
        }
      } else if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.employeeId = (user as any).employeeId;
        token.department = (user as any).department;
        token.designation = (user as any).designation;
        token.avatar = (user as any).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).employeeId = token.employeeId;
        (session.user as any).department = token.department;
        (session.user as any).designation = token.designation;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
