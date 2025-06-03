import { createContext, useState, useEffect } from "react";
import runChat from "../config/gemini";

// Rename from Context to ChatContext to avoid collision with React's Context
export const ChatContext = createContext();

// Rename the component to match
const ChatContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState(() => {
    const saved = localStorage.getItem("prevPrompts");
    return saved ? JSON.parse(saved) : [];
  });
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState(null);

  // Save prevPrompts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("prevPrompts", JSON.stringify(prevPrompts));
  }, [prevPrompts]);

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 10 * index); // Faster typing animation
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
    setError(null);
  };

  const formatMarkdown = (text) => {
    if (!text) return "";

    // Format code blocks
    let formatted = text.replace(
      /```([a-z]*)([\s\S]*?)```/g,
      '<pre class="code-block"><code class="language-$1">$2</code></pre>'
    );

    // Format bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Format italics
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Format lists
    formatted = formatted.replace(/^\s*-\s+(.*)/gm, "<li>$1</li>");
    formatted = formatted.replace(/(<li>.*<\/li>)(?:\n|$)+/g, "<ul>$1</ul>");

    // Format links
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Format paragraphs
    formatted = formatted.replace(/\n\n/g, "</p><p>");

    return formatted;
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setError(null);

    let currentPrompt;

    if (prompt) {
      currentPrompt = prompt;
      setRecentPrompt(prompt);
    } else {
      currentPrompt = input;
      setPrevPrompts((prev) =>
        prev.includes(input) ? prev : [...prev, input]
      );
      setRecentPrompt(input);
    }

    try {
      const response = await runChat(currentPrompt);

      // Check if response indicates an error
      if (
        response.includes("error") ||
        response.includes("quota") ||
        response.includes("limit")
      ) {
        setError(response);
        setResultData(response);
        setLoading(false);
        return;
      }

      // Format the response with Markdown
      const formattedResponse = formatMarkdown(response);

      // Use a faster typing effect for a more responsive feel
      const words = formattedResponse.split(" ");
      for (let i = 0; i < words.length; i++) {
        delayPara(i, i === 0 ? words[i] : " " + words[i]);
      }
    } catch (err) {
      console.error("Error in chat:", err);
      setError(
        "Sorry, there was an error processing your request. Please try again."
      );
      setResultData(
        "Sorry, there was an error processing your request. Please try again."
      );
    }

    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
    error,
  };

  return (
    <ChatContext.Provider value={contextValue}>{props.children}</ChatContext.Provider>
  );
};

// Export the renamed provider
export default ChatContextProvider;
