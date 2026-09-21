'use client';

import { useState, useEffect } from 'react';
import PromptCard from '@components/PromptCard/PromptCard';

const PromptCardList = ({ data, handleTagClick }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="mt-16 text-center text-gray-500">No prompts found.</p>;
  }
  return (
    <ul className="mt-16 prompt_layout">
      {data.map(post => (
        <PromptCard key={post._id} post={post} handleTagClick={handleTagClick} />
      ))}
    </ul>
  );
};

const Feed = () => {
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState([]);
  const [searchedResults, setSearchedResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/prompt');
        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error('Failed to fetch prompts:', data);
          setPosts([]);
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const filterPrompts = searchText => {
    if (!searchText) return posts;
    const regex = new RegExp(escapeRegExp(searchText), 'i');
    return posts.filter(
      post => regex.test(post.creator?.username) || regex.test(post.tag) || regex.test(post.prompt)
    );
  };

  const handleSearchChange = e => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    setSearchTimeout(
      setTimeout(() => {
        const searchResult = filterPrompts(e.target.value);
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleTagClick = tagName => {
    setSearchText(tagName);
    const searchResult = filterPrompts(tagName);
    setSearchedResults(searchResult);
  };

  return (
    <section className="feed">
      <form className="relative w-full flex-center">
        <input
          type="text"
          placeholder="Search for tag or username"
          value={searchText}
          onChange={handleSearchChange}
          required
          className="search_input peer"
        />
      </form>

      {searchText ? (
        <PromptCardList data={searchedResults} handleTagClick={handleTagClick} />
      ) : (
        <PromptCardList data={posts} handleTagClick={handleTagClick} />
      )}
    </section>
  );
};

export default Feed;
