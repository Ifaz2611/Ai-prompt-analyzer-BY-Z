'use client';

import { useState, useEffect } from 'react';
import PromptCard from '@components/PromptCard/PromptCard';

const PromptCardList = ({ data, handleTagClick }) => {
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
      const response = await fetch('/api/prompt');

      const data = await response.json();

      setPosts(data);
    };

    fetchPosts();
  }, []);

  const filterPrompts = searchText => {
    const regex = new RegExp(searchText, 'i');

    return posts.filter(
      post => regex.test(post.creator.username) || regex.test(post.tag) || regex.test(post.prompt)
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
          placeholder="Search fro tag or username"
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
