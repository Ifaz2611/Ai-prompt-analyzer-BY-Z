import { connectToDB } from '@utils/database';
import Prompt from '@models/prompt';

export const GET = async request => {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    let filter = {};
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = {
        $or: [
          { prompt: { $regex: escaped, $options: 'i' } },
          { tag: { $regex: escaped, $options: 'i' } },
        ],
      };
    }

    const prompts = await Prompt.find(filter).populate('creator').sort({ createdAt: -1 });

    return new Response(JSON.stringify(prompts), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to fetch all prompts: ${error.message}` }), { status: 500 });
  }
};
