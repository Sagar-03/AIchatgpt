import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import '../styles/ChatInput.css';
import VoiceInputButton from './VoiceInputButton'; // Import VoiceInputButton

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  
  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim() || isLoading || disabled) return;
    
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    
    try {
      await onSendMessage(messageText);
    } finally {
      setIsLoading(false);
      // Re-focus input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle voice input transcript
  const handleVoiceTranscript = (transcript) => {
    setInputText(prev => {
      // If there's existing text, append the transcript with a space
      return prev.trim() ? `${prev.trim()} ${transcript}` : transcript;
    });
    
    // Focus the input after receiving transcript
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            disabled={isLoading || disabled}
            className={`chat-input ${isListening ? 'listening' : ''}`}
            rows={1}
            autoComplete="off"
            autoFocus
          />
          
          <div className="input-actions">
            <VoiceInputButton 
              onTranscript={handleVoiceTranscript}
              onListening={setIsListening}
              buttonClass="voice-input-btn"
              activeClass="voice-active"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isLoading || disabled} 
              className="send-button"
              aria-label="Send message"
            >
              {isLoading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </div>
        
        <div className="input-help">
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
