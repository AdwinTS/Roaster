// src/App.jsx
import React, { useState, useEffect } from 'react';

function App() {
  // State to manage the emoji based on hover
  const [emoji, setEmoji] = useState('😎'); // Cooling glasses emoji
  const [username, setUsername] = useState(''); // State for the input field
  const [roastResult, setRoastResult] = useState(''); // State to store the generated roast
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(''); // State for error messages

  // State for the vanishing/appearing message on the left (small paragraphs)
  const messages = [
    "Unleash the truth hidden within the lines of code. Every commit tells a story, and we're here to read it.",
    "No code is truly safe from a thorough examination. Our algorithms are designed to find every hidden gem and potential pitfall.",
    "Prepare for a deep analysis of your contributions. We delve into the logic, style, and efficiency of your work.",
    "The roast is officially on. Brace yourself for insights that will elevate your coding game to the next level.",
    "This isn't just code review; it's an intensified, insightful, and sometimes hilarious breakdown of your programming prowess."
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  // State for the rotating keywords on the right
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
      setMessageVisible(false); // Start fading out
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setMessageVisible(true); // Fade in new message
      }, 1000); // Wait for fade-out to complete before changing message and fading in
    }, 5000); // Change message every 5 seconds (including fade in/out)

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Effect for rotating keywords on the right
  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordVisible(false); // Start fading out
      setTimeout(() => {
        setCurrentKeywordIndex((prevIndex) => (prevIndex + 1) % keywords.length);
        setKeywordVisible(true); // Fade in new keyword
      }, 500); // Wait for fade-out to complete before changing keyword and fading in
    }, 2500); // Change keyword every 2.5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  // Function to handle mouse entering the emoji area
  const handleMouseEnter = () => {
    setEmoji('🤫'); // Silent emoji
  };

  // Function to handle mouse leaving the emoji area
  const handleMouseLeave = () => {
    setEmoji('😎'); // Back to cooling glasses emoji
  };

  // Function to handle input change
  const handleInputChange = (event) => {
    setUsername(event.target.value);
    setRoastResult(''); // Clear previous roast when typing
    setError(''); // Clear previous error when typing
  };

  // Function to handle the "Roast!" button click
  const handleRoast = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }

    setIsLoading(true);
    setRoastResult('');
    setError('');

    try {
      // 1. Fetch GitHub user data
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

      // 2. Call Gemini API to generate the roast
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      // IMPORTANT: Access the API key from Vite's environment variables
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // <--- CHANGED THIS LINE
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
    // Main container for the entire page, ensuring full height and centering
    <div className="h-screen w-screen flex flex-col items-center justify-between bg-gray-900 text-white font-inter overflow-hidden"> {/* Added overflow-hidden to prevent scrollbars from animations */}

      {/* Heading */}
      <header className="w-full text-center py-8 px-4">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 drop-shadow-lg">
          Roaster Pro
        </h1>
      </header>

      {/* Interactive Emoji Section */}
      <section className="flex items-center justify-center flex-grow w-full px-4 relative"> {/* Added relative for absolute positioning of side content */}

        {/* Dynamic Message to the Left */}
        <div className="absolute left-4 md:left-8 lg:left-16 top-1/2 -translate-y-1/2 text-right hidden md:block max-w-xs"> {/* Added max-w-xs for paragraph width */}
          <p
            className={`text-xl md:text-2xl font-medium text-gray-400 transition-opacity duration-1000 ${
              messageVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Emoji in the Center */}
        <div
          className="text-9xl md:text-[12rem] lg:text-[15rem] cursor-pointer transition-transform duration-300 hover:scale-105 mx-auto" // mx-auto helps center it
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Interactive Emoji"
          role="img"
        >
          {emoji}
        </div>

        {/* Rotating Keywords to the Right */}
        <div className="absolute right-4 md:right-8 lg:right-16 top-1/2 -translate-y-1/2 text-left hidden md:block max-w-xs"> {/* Added max-w-xs */}
          <p
            className={`text-xl md:text-2xl font-bold text-purple-400 transition-opacity duration-500 ${
              keywordVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {keywords[currentKeywordIndex]}
          </p>
        </div>

      </section>

      {/* Message below the emoji */}
      <p className="mt-8 text-2xl md:text-3xl font-semibold text-gray-300 text-center w-full max-w-2xl px-4">
        This is the perfect roaster.
      </p>

      {/* Input Field Section */}
      <footer className="w-full py-8 flex flex-col items-center px-4">
        <div className="flex w-full max-w-md space-x-2"> {/* Container for input and button */}
          <input
            type="text"
            placeholder="ENTER THE GITHUB USERNAME TO ROAST HEHE"
            value={username}
            onChange={handleInputChange}
            className="flex-grow p-4 text-lg bg-gray-800 border border-gray-700 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
          />
          <button
            onClick={handleRoast}
            disabled={isLoading} // Disable button when loading
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Roasting...' : 'Roast!'}
          </button>
        </div>

        {/* Roast Result / Loading / Error Display */}
        {isLoading && (
          <p className="mt-4 text-lg text-purple-400">Fetching GitHub data and crafting the roast...</p>
        )}
        {error && (
          <p className="mt-4 text-lg text-red-500">{error}</p>
        )}
        {roastResult && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-inner max-w-2xl text-center overflow-auto max-h-48"> {/* Changed max-w-md to max-w-2xl, added overflow-auto and max-h-48 */}
            <p className="text-xl italic text-gray-300">"{roastResult}"</p>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
