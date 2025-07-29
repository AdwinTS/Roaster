// src/App.jsx
import React, { useState, useEffect } from 'react';

function App() {
  const [emoji, setEmoji] = useState('😎');
  const [username, setUsername] = useState('');
  const [roastResult, setRoastResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messages = [
    "Unleash the truth hidden within the lines of code. Every commit tells a story, and we're here to read it.",
    "No code is truly safe from a thorough examination. Our algorithms are designed to find every hidden gem and potential pitfall.",
    "Prepare for a deep analysis of your contributions. We delve into the logic, style, and efficiency of your work.",
    "The roast is officially on. Brace yourself for insights that will elevate your coding game to the next level.",
    "This isn't just code review; it's an intensified, insightful, and sometimes hilarious breakdown of your programming prowess."
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  const keywords = [
    "Efficiency",
    "Readability",
    "Bugs",
    "Performance",
    "Best Practices",
    "Refactoring"
  ];
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [keywordVisible, setKeywordVisible] = useState(true);

  // Effect for vanishing/appearing message on the left
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageVisible(false);
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setMessageVisible(true);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Effect for rotating keywords on the right
  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordVisible(false);
      setTimeout(() => {
        setCurrentKeywordIndex((prevIndex) => (prevIndex + 1) % keywords.length);
        setKeywordVisible(true);
      }, 500);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handle emoji hover
  const handleMouseEnter = () => setEmoji('🤫');
  const handleMouseLeave = () => setEmoji('😎');

  // Handle input change
  const handleInputChange = (event) => {
    setUsername(event.target.value);
    setRoastResult('');
    setError('');
  };

  // Function to handle the "Roast!" button click and API calls
  const handleRoast = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }

    setIsLoading(true);
    setRoastResult('');
    setError('');

    try {
      // Fetch GitHub user data
      const githubResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!githubResponse.ok) {
        if (githubResponse.status === 404) {
          throw new Error(`GitHub user "${username}" not found. Typo?`);
        }
        throw new Error(`Failed to fetch GitHub data: ${githubResponse.statusText}`);
      }
      const githubData = await githubResponse.json();

      // Prepare prompt for LLM
      const prompt = `Generate a funny, light-hearted, and sarcastic roast for a GitHub user based on the following public profile data. Keep it concise, around 2-3 sentences. Focus on aspects like:
      - Number of public repositories: ${githubData.public_repos}
      - Number of followers: ${githubData.followers}
      - Number of users they are following: ${githubData.following}
      - Account creation date: ${new Date(githubData.created_at).toLocaleDateString()}
      - Bio: ${githubData.bio || 'No bio provided'}
      - Location: ${githubData.location || 'Not specified'}
      - Company: ${githubData.company || 'Not specified'}
      - Is a hireable user: ${githubData.hireable ? 'Yes' : 'No'}

      Example roast tone: "Oh, look at this coding prodigy with a whopping 5 public repos! Clearly, they're saving all their groundbreaking work for a top-secret government project. Or maybe just for their local machine."

      Roast for GitHub user "${username}":`;

      // Call Gemini API to generate the roast
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await geminiResponse.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setRoastResult(text);
      } else {
        throw new Error("Failed to generate roast: No content from AI.");
      }

    } catch (err) {
      console.error("Roast error:", err);
      setError(`Failed to roast: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main page container with full height and width, dark background
    <div className="h-screen w-screen flex flex-col items-center justify-between bg-gray-900 text-white font-inter overflow-hidden">

      {/* Page Heading */}
      <header className="w-full text-center py-8 px-4">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 drop-shadow-lg">
          Roaster Pro
        </h1>
      </header>

      {/* Interactive Content Section (Emoji and side messages) */}
      <section className="flex items-center justify-center flex-grow w-full px-4 relative">

        {/* Dynamic Message on the Left */}
        <div className="absolute left-4 md:left-8 lg:left-16 top-1/2 -translate-y-1/2 text-right hidden md:block max-w-xs">
          <p
            className={`text-xl md:text-2xl font-medium text-gray-400 transition-opacity duration-1000 ${
              messageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Central Interactive Emoji */}
        <div
          className="text-9xl md:text-[12rem] lg:text-[15rem] cursor-pointer transition-transform duration-300 hover:scale-105 mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Interactive Emoji"
          role="img"
        >
          {emoji}
        </div>

        {/* Rotating Keywords on the Right */}
        <div className="absolute right-4 md:right-8 lg:right-16 top-1/2 -translate-y-1/2 text-left hidden md:block max-w-xs">
          <p
            className={`text-xl md:text-2xl font-bold text-purple-400 transition-opacity duration-500 ${
              keywordVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {keywords[currentKeywordIndex]}
          </p>
        </div>

      </section>

      {/* Main Message */}
      <p className="mt-8 text-2xl md:text-3xl font-semibold text-gray-300 text-center w-full max-w-2xl px-4">
        This is the perfect roaster.
      </p>

      {/* Input and Roast Result Section */}
      <footer className="w-full py-8 flex flex-col items-center px-4">
        <div className="flex w-full max-w-md space-x-2">
          <input
            type="text"
            placeholder="ENTER THE GITHUB USERNAME TO ROAST HEHE"
            value={username}
            onChange={handleInputChange}
            className="flex-grow p-4 text-lg bg-gray-800 border border-gray-700 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
          />
          <button
            onClick={handleRoast}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Roasting...' : 'Roast!'}
          </button>
        </div>

        {/* Loading, Error, or Roast Output */}
        {isLoading && (
          <p className="mt-4 text-lg text-purple-400">Fetching GitHub data and crafting the roast...</p>
        )}
        {error && (
          <p className="mt-4 text-lg text-red-500">{error}</p>
        )}
        {roastResult && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner max-w-2xl text-center overflow-auto max-h-48">
            <p className="text-xl italic text-gray-300">"{roastResult}"</p>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
