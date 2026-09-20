import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDB } from '@utils/database';
import User from '@models/user';

const generateUsername = (name, email) => {
  // Create slug: lowercase, alphanumeric, dot/underscore allowed, 8-20 chars
  let base = (name || email.split('@')[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .replace(/^[_.]+|[_.]+$/g, '');
  if (base.length < 8) base = (base + '12345678').slice(0, 8);
  if (base.length > 20) base = base.slice(0, 20);
  // ensure it doesn't start/end with _ or . and no consecutive __ or ..
  base = base.replace(/__+/g, '_').replace(/\.\.+/g, '.');
  if (/^[_.]/.test(base)) base = 'u' + base.slice(1);
  if (/[_.]$/.test(base)) base = base.slice(0, -1) + '1';
  return base;
};

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Fallback credentials provider so the site works without Google OAuth (demo login)
// Login with any email that exists in DB, or create demo user on the fly in dev
providers.push(
  CredentialsProvider({
    name: 'Demo Login',
    credentials: {
      email: { label: 'Email', type: 'text', placeholder: 'demo@example.com' },
      username: { label: 'Username', type: 'text', placeholder: 'demo_user' },
    },
    async authorize(credentials) {
      await connectToDB();
      if (!credentials?.email) return null;
      const email = credentials.email.toLowerCase().trim();
      let user = await User.findOne({ email });
      if (!user) {
        // Auto-create demo user for easy testing if no user exists
        const rawName = credentials.username || email.split('@')[0];
        let username = generateUsername(rawName, email);
        // Ensure uniqueness with suffix if needed
        let suffix = 0;
        let candidate = username;
        while (await User.findOne({ username: candidate })) {
          suffix += 1;
          candidate = `${username.slice(0, 18)}${suffix}`;
        }
        username = candidate;
        user = await User.create({
          email,
          username,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
        });
      }
      return { id: user._id.toString(), email: user.email, name: user.username, image: user.image };
    },
  })
);

const handler = NextAuth({
  providers,
  callbacks: {
    async session({ session }) {
      try {
        await connectToDB();
        const sessionUser = await User.findOne({ email: session.user.email });
        if (sessionUser) {
          session.user.id = sessionUser._id.toString();
          session.user.name = sessionUser.username;
          session.user.image = sessionUser.image;
        }
        return session;
      } catch (err) {
        console.error('session callback error:', err);
        return session;
      }
    },

    async signIn({ profile, account, user }) {
      try {
        await connectToDB();

        // Credentials provider already handled user creation in authorize
        if (account?.provider === 'credentials') return true;

        if (!profile?.email) return false;

        const userExists = await User.findOne({ email: profile.email });

        if (!userExists) {
          let username = generateUsername(profile.name, profile.email);
          let suffix = 0;
          let candidate = username;
          while (await User.findOne({ username: candidate })) {
            suffix += 1;
            candidate = `${username.slice(0, 18)}${suffix}`;
          }
          username = candidate;

          await User.create({
            email: profile.email,
            username,
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log('Error checking if user exists: ', error.message);
        return false;
      }
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: process.env.NODE_ENV !== 'production',
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
