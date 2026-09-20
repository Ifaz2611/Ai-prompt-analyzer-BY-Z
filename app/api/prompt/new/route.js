import Prompt from '@models/prompt';
import { connectToDB } from '@utils/database';

export const POST = async req => {
  const { userId, prompt, tag } = await req.json();

  if (!userId || !prompt?.trim() || !tag?.trim()) {
    return new Response(JSON.stringify({ error: 'userId, prompt and tag are required' }), { status: 400 });
  }

  try {
    await connectToDB();

    const newPrompt = new Prompt({
      creator: userId,
      prompt: prompt.trim(),
      tag: tag.trim().replace(/^#/, '').toLowerCase(),
    });

    await newPrompt.save();

    return new Response(JSON.stringify(newPrompt), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to create a new prompt: ${error.message}` }), { status: 500 });
  }
};
