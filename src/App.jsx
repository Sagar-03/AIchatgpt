import { useState, useEffect } from 'react';
// import Sidebar from './components/Sidebar/Sidebar'; // Sidebar not needed now
import Main from './components/Main/Main';
import './styles/App.css';

function App() {
  // Sidebar visibility state - commented out as sidebar not needed now
  // const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 768);

  // Commenting out resize handler as sidebar is not needed
  /*
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
  */

  // Set sidebar margin to 0 since we're not using sidebar
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-margin', '0px');
  }, []);

  return (
    <div className="app">
      {/* Sidebar removed as not needed now */}
      {/* <Sidebar isVisible={isSidebarVisible} onToggle={toggleSidebar} /> */}
      <Main />
    </div>
  );
}

export default App;
