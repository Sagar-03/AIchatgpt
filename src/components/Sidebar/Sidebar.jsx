import React, { useContext, useState, useEffect } from 'react';
import './Sidebar.css';
import { ChatContext } from '../../context/Context';
import ThemeToggle from '../ThemeToggle';
import { 
  FaPlus, FaHistory, FaTrash, FaCommentAlt, 
  FaCog, FaBars, FaTimes, FaRocket
} from 'react-icons/fa';

const Sidebar = ({ isVisible = true, onToggle }) => {
  const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(ChatContext);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const toggleSidebar = () => {
    onToggle();
  };
  
  const loadPrompt = (prompt) => {
    setRecentPrompt(prompt);
    onSent(prompt);
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };
  
  const handleNewChat = () => {
    newChat();
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };
  
  const handleClearAll = () => {
    if (showConfirmClear) {
      // Clear all chats logic
      localStorage.removeItem("prevPrompts");
      window.location.reload();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };
  
  // Format time for display
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Update body class to prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth <= 768 && isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="toggle-sidebar"
        onClick={onToggle}
        aria-label={isVisible ? 'Close sidebar' : 'Open sidebar'}
      >
        {isVisible ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Sidebar */}
      <div className={`sidebar ${isVisible ? 'visible' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaRocket size={24} color="#7C4DFF" />
            <span className="logo-text">Gemini AI Chat</span>
          </div>
          <div className="menu-toggle" onClick={toggleSidebar}>
            <FaTimes />
          </div>
        </div>
        
        <div className="sidebar-content">
          <div className="new-chat" onClick={handleNewChat}>
            <div className="new-chat-icon">
              <FaPlus size={16} />
            </div>
            <span className="new-chat-text">New Chat</span>
          </div>
          
          {prevPrompts.length > 0 && (
            <div className="sidebar-section">
              <h3 className="section-title">
                <FaHistory size={14} style={{ marginRight: '8px' }} />
                Recent Chats
              </h3>
              <div className="recent-chats">
                {prevPrompts.map((item, index) => (
                  <div 
                    key={index}
                    className="conversation-item" 
                    onClick={() => loadPrompt(item)}
                  >
                    <div className="conversation-icon">
                      <FaCommentAlt size={14} />
                    </div>
                    <div className="conversation-details">
                      <div className="conversation-title">
                        {item.length > 25 ? item.slice(0, 25) + '...' : item}
                      </div>
                      <div className="conversation-date">
                        {formatDate()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="sidebar-footer">
          {showConfirmClear ? (
            <div className="confirm-clear">
              <p>Are you sure you want to clear all chats?</p>
              <div className="confirm-actions">
                <button onClick={handleClearAll} className="confirm-yes">Yes, clear all</button>
                <button onClick={() => setShowConfirmClear(false)} className="confirm-no">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className="clear-all-btn" onClick={handleClearAll}>
                <FaTrash size={14} style={{ marginRight: '8px' }} /> Clear All Chats
              </button>
              
              <div className="settings-container">
                <div className="settings-btn">
                  <FaCog size={14} style={{ marginRight: '8px' }} /> Settings
                </div>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isVisible && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}
    </>
  );
};

export default Sidebar;
