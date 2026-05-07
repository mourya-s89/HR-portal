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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
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

        // Persist Google profile image if not already set
        if (!existingUser.avatar && user.image) {
          existingUser.avatar = user.image;
          await existingUser.save();
        }

        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // First time user signs in, capture all info from provider
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.avatar = (user as any).avatar;
      }

      // Merge with database info
      if (token.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.employeeId = dbUser.employeeId;
          token.department = dbUser.department;
          token.designation = dbUser.designation;
          // Use DB avatar if exists, else use provider image
          token.avatar = dbUser.avatar;
          token.picture = dbUser.avatar || token.picture;
        }
      }
      
      console.log("JWT Callback - Final picture URL:", token.picture ? "Present" : "Missing");
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as any;
        u.id = token.id;
        u.role = token.role;
        u.employeeId = token.employeeId;
        u.department = token.department;
        u.designation = token.designation;
        u.avatar = token.avatar;
        u.name = token.name;
        u.email = token.email;
        u.image = token.picture as string;
      }
      console.log("Session Callback - User Image URL:", session.user?.image ? "Found" : "Not Found");
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
