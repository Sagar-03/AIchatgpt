import React, { useContext, useState, useEffect, useRef } from 'react';
import './Main.css';
import './MessageStyles.css';  // Import message styling
import { ChatContext } from '../../context/Context';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaUser, FaRobot, FaCompass, FaLightbulb, FaCode, 
  FaHandsHelping, FaPaperPlane, FaMicrophone, FaImage,
  FaTimes, FaClock, FaCheck, FaRocket, FaVolumeMute,
  FaBookmark, FaChartBar, FaDatabase, FaMagic
} from 'react-icons/fa';
import ThemeToggle from '../ThemeToggle';
import VoiceModal from './VoiceModal';

const Main = () => {
  const { 
    onSent, 
    recentPrompt, 
    showResult, 
    loading, 
    resultData, 
    setInput, 
    input,
    prevPrompts
  } = useContext(ChatContext);
  
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Enhanced suggestions with additional options
  const suggestions = [
    { 
      text: "Suggest beautiful places to see on an upcoming road trip", 
      icon: <FaCompass />,
      category: "Travel"
    },
    { 
      text: "Briefly summarize this concept: urban planning", 
      icon: <FaLightbulb />,
      category: "Knowledge"
    },
    { 
      text: "Brainstorm team bonding activities for our work retreat", 
      icon: <FaHandsHelping />,
      category: "Work"
    },
    { 
      text: "Improve the readability of my JavaScript code", 
      icon: <FaCode />,
      category: "Coding"
    },
    { 
      text: "Create an effective data visualization strategy", 
      icon: <FaChartBar />,
      category: "Analytics"
    },
    { 
      text: "Design a reading list for someone interested in AI", 
      icon: <FaBookmark />,
      category: "Learning"
    },
    { 
      text: "What are best practices for database optimization?", 
      icon: <FaDatabase />,
      category: "Technical"
    },
    { 
      text: "Generate creative names for a new tech startup", 
      icon: <FaMagic />,
      category: "Creativity"
    }
  ];

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setVoiceSupported(false);
    }
    
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [resultData, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      onSent();
      setInput('');
    }
  };

  const handleSuggestClick = (suggestion) => {
    setInput(suggestion);
    onSent(suggestion);
  };

  const handleMicrophoneToggle = () => {
    if (!voiceSupported) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    // If already listening, stop it
    if (listening) {
      stopListening();
      return;
    }
    
    // Start voice modal
    setShowVoiceModal(true);
    startListening();
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setTranscript(transcript);
    };
    
    recognition.onend = () => {
      stopListening();
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopListening();
    };
    
    try {
      recognition.start();
      window.speechRecognition = recognition;
    } catch (err) {
      console.error('Speech recognition error', err);
      stopListening();
    }
  };

  const stopListening = () => {
    if (window.speechRecognition) {
      window.speechRecognition.stop();
    }
    setListening(false);
    // Keep modal open if we have transcript
  };

  const handleVoiceSubmit = () => {
    if (transcript.trim()) {
      setInput(transcript);
      setShowVoiceModal(false);
      stopListening();
      
      // Small delay to ensure input is set before submission
      setTimeout(() => {
        onSent(transcript);
      }, 100);
    }
  };

  const cancelVoiceInput = () => {
    stopListening();
    setShowVoiceModal(false);
    setTranscript("");
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-title">
          <FaRocket color="#7C4DFF" />
          <h2>{prevPrompts.length > 0 ? 'AI Assistant' : 'Welcome to AI Assistant'}</h2>
        </div>
        <div className="chat-header-actions">
          <ThemeToggle />
          <div className="user-profile">
            <div className="user-avatar">U</div>
          </div>
        </div>
      </div>
      
      <div className="messages-container">
        {!showResult ? (
          <div className="welcome-container">
            <div className="welcome-content">
              <div className="welcome-header">
                <div className="welcome-icon">
                  <FaRobot />
                </div>
                <h1 className="welcome-title">How can I assist you today?</h1>
                <p className="welcome-subtitle">Ask me anything or try one of these suggestions</p>
              </div>
              
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="suggestion-card"
                    onClick={() => handleSuggestClick(suggestion.text)}
                  >
                    <div className="card-category">{suggestion.category}</div>
                    <div className="card-text">{suggestion.text}</div>
                    <div className="card-icon">
                      {suggestion.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>            <div className="message user">
              <div className="message-avatar">
                <FaUser />
              </div>
              <div className="message-content">
                <div className="message-bubble">{recentPrompt}</div>
                <div className="message-info">
                  <FaClock size={10} />
                  {formatTimestamp()}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <div className="message assistant">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message-bubble" dangerouslySetInnerHTML={{ __html: resultData }}></div>
                  <div className="message-info">
                    <FaCheck size={10} />
                    {formatTimestamp()}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-box">
          <input
            ref={inputRef}
            type="text"
            placeholder={listening ? 'Listening...' : 'Ask anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={listening}
          />
          <div className="input-actions">
            <div className="input-action-btn">
              <FaImage size={18} />
            </div>
            <div 
              className={`input-action-btn ${listening ? 'active' : ''}`}
              onClick={handleMicrophoneToggle}
            >
              {listening ? <FaTimes size={18} /> : <FaMicrophone size={18} />}
            </div>
            {input.trim() && (
              <div className="input-action-btn send" onClick={handleSubmit}>
                <FaPaperPlane size={16} />
              </div>
            )}
          </div>
        </form>
        <p className="footer-info">
          AI Assistant may display inaccurate or offensive information that doesn't represent Google's views.
        </p>
      </div>

      {/* Voice Input Modal */}
      {showVoiceModal && (
        <div className="voice-modal-overlay" onClick={cancelVoiceInput}>
          <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`voice-modal-icon ${listening ? 'listening' : ''}`}>
              {listening ? <FaMicrophone /> : <FaVolumeMute />}
              <div className="voice-ripples"></div>
            </div>
            
            <h3 className="voice-modal-title">
              {listening ? 'Listening...' : 'Voice input'}
            </h3>
            
            <div className="voice-modal-transcript">
              {transcript || 'Speak now...'}
            </div>
            
            <div className="voice-modal-actions">
              <button className="voice-modal-cancel" onClick={cancelVoiceInput}>
                Cancel
              </button>
              <button 
                className="voice-modal-submit"
                onClick={handleVoiceSubmit}
                disabled={!transcript.trim()}
              >
                Submit <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
