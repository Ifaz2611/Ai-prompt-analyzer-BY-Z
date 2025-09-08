'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Profile from '@components/Profile/Profile';

const MyProfile = () => {
  const { data: session, status } = useSession({ waitFor: 'user' });
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/users/${session?.user.id}/posts`);
        const data = await response.json();

        setPosts(data);
      } catch (error) {
        console.log('Error fetching posts:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.id) {
      fetchPosts();
    } else if (status === 'unauthenticated') {
      // Redirect to home page if not authenticated
      router.push('/');
    }
  }, [session, status, router]);

  const handleEdit = post => {
    router.push(`/update-prompt?id=${post._id}`);
  };

  const handleDelete = async post => {
    const hasConfirmed = confirm('Are you sure you want to delete this prompt?');

    if (hasConfirmed) {
      try {
        await fetch(`/api/prompt/${post._id.toString()}`, {
          method: 'DELETE',
        });

        const filteredPosts = posts.filter(p => p._id !== post._id);

        setPosts(filteredPosts);
      } catch (error) {}
    }
  };
  return (
    <Profile
      name="My"
      desc="Welcome to your personalized page. Share your exceptional prompts and inspire others with the power of your imagination"
      data={posts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  );
};

export default MyProfile;
