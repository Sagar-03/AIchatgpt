import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaHistory, FaCog, FaBars, FaTimes, FaSearch, FaRegComments, FaInfoCircle, FaBrain, FaDatabase, FaStar } from 'react-icons/fa';
import { BsChatLeftText, BsChatDots, BsRobot, BsLightningChargeFill, BsStars } from 'react-icons/bs';
import '../styles/SideNavbar.css';

const SideNavbar = ({ 
  conversations = [], 
  currentConversationId, 
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation, 
  onClearAllChats 
}) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const sidebarRef = useRef(null);
  
  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !event.target.classList.contains('toggle-sidebar')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    onDeleteConversation(id);
  };
  
  const handleClearAll = () => {
    if (showConfirmClear) {
      onClearAllChats();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  // Filter conversations based on search term
  const filteredConversations = searchTerm.trim() === '' 
    ? conversations 
    : conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Format date for display with enhanced look
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Function to determine icon for conversation based on its content
  const getConversationIcon = (conversation) => {
    // A simple algorithm to vary icons
    const id = conversation.id;
    const iconIndex = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % 5;
    
    switch (iconIndex) {
      case 0: return <BsChatDots />;
      case 1: return <FaBrain />;
      case 2: return <BsStars />; 
      case 3: return <BsLightningChargeFill />;
      default: return <BsChatLeftText />;
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="toggle-sidebar"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`side-navbar ${isOpen ? 'open' : 'closed'}`}
      >
        <div className="sidebar-header">
          <h2><BsRobot /> Gemini AI Chat</h2>
          <button 
            className="new-chat-btn" 
            onClick={onNewChat}
            aria-label="Create new chat"
          >
            <FaPlus /> New Chat
          </button>
        </div>
        
        <div className="sidebar-content">
          {conversations.length > 0 && (
            <div className="search-wrapper">
              <div className="input-container search-container">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search conversations" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="search-clear"
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {filteredConversations.length > 0 ? (
            <div className="conversation-list">
              <h3><FaHistory /> Recent Chats</h3>
              {filteredConversations.map((conversation, index) => (
                <div 
                  key={conversation.id}
                  className={`conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`}
                  onClick={() => onSelectConversation(conversation.id)}
                  style={{ '--i': index }}
                >
                  <div className="conversation-icon">
                    {getConversationIcon(conversation)}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-title">
                      {conversation.title}
                    </div>
                    <div className="conversation-date">
                      {formatDate(conversation.updatedAt)}
                    </div>
                    <div className="conversation-stats">
                      <span>{conversation.messages.length} messages</span>
                    </div>
                  </div>
                  <button 
                    className="delete-conversation"
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    aria-label="Delete conversation"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <FaSearch />
                  <p>No results found</p>
                  <p>Try different keywords or clear search</p>
                </>
              ) : (
                <>
                  <FaRegComments />
                  <p>No conversations yet</p>
                  <p>Start a new chat by clicking the button above</p>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="sidebar-footer">
          {showConfirmClear ? (
            <div className="confirm-clear">
              <p>Are you sure?</p>
              <div className="confirm-actions">
                <button onClick={handleClearAll} className="confirm-yes">Yes, clear all</button>
                <button onClick={() => setShowConfirmClear(false)} className="confirm-no">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className="clear-all-btn" onClick={handleClearAll}>
                <FaTrash /> Clear All Chats
              </button>
              <button className="settings-btn">
                <FaCog /> Settings
              </button>
              <div className="sidebar-info">
                <FaInfoCircle size={14} />
                <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
              </div>
            </>
          )}
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={toggleSidebar} />
      )}
    </>
  );
};

export default SideNavbar;
