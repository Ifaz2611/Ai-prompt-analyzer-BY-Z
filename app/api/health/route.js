import { connectToDB } from '@utils/database';

export const GET = async () => {
  const envStatus = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  };

  try {
    await connectToDB();
    return new Response(
      JSON.stringify({
        status: 'ok',
        database: 'connected',
        env: envStatus,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        database: 'disconnected',
        error: error.message,
        hint: 'Check MONGODB_URI in .env.local and Atlas IP whitelist (Network Access -> Allow 0.0.0.0/0 for testing). Ensure cluster is not paused.',
        env: envStatus,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
