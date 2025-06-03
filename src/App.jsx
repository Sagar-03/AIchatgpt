import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import './styles/App.css';

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarVisible(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Update CSS variable for input container positioning
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-margin', 
      isSidebarVisible && window.innerWidth > 768 ? '300px' : '0px'
    );
  }, [isSidebarVisible]);

  return (
    <div className={`app ${isSidebarVisible ? 'sidebar-visible' : ''}`}>
      <Sidebar isVisible={isSidebarVisible} onToggle={toggleSidebar} />
      <Main />
    </div>
  );
}

export default App;
