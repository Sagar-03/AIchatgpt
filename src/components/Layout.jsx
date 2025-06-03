import { useState, useEffect, useCallback } from 'react';
import SideNavbar from './SideNavbar';
import '../styles/Layout.css';

const Layout = ({ 
  children, 
  conversations = [], 
  currentConversationId,
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation, 
  onClearAllChats
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  // Handle sidebar toggle
  const handleSidebarToggle = useCallback((isOpen) => {
    setIsSidebarOpen(isOpen);
  }, []);
  
  // Update layout on sidebar toggle and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="layout">
      <SideNavbar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={onNewChat}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
        onClearAllChats={onClearAllChats}
        onToggle={handleSidebarToggle}
      />
      
      <main className={`main-content ${!isSidebarOpen || window.innerWidth <= 768 ? 'full-width' : ''}`}>
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
