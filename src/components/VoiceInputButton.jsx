import { useState, useEffect, useCallback } from 'react';
import { FaMicrophone, FaStop, FaMicrophoneSlash } from 'react-icons/fa';
import { isSpeechRecognitionSupported, startVoiceInput, checkMicrophoneAccess } from '../utils/voiceInput';

/**
 * Voice Input Button Component
 * @param {object} props - Component props
 * @param {function} props.onTranscript - Callback when transcript is available
 * @param {function} props.onListening - Callback when listening status changes
 * @param {string} props.buttonClass - CSS class for the button
 * @param {string} props.activeClass - CSS class to add when active
 */
const VoiceInputButton = ({ 
  onTranscript, 
  onListening = () => {}, 
  buttonClass = 'voice-button',
  activeClass = 'listening'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [controller, setController] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Check if speech recognition is supported
  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    
    // Check microphone permission
    const checkPermission = async () => {
      const hasMic = await checkMicrophoneAccess();
      setHasPermission(hasMic);
    };
    
    checkPermission();
  }, []);
  
  // Stop listening when component unmounts
  useEffect(() => {
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);
  
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening && controller) {
      controller.stop();
      setIsListening(false);
      onListening(false);
      setInterimTranscript('');
      setController(null);
      return;
    }
    
    if (!supported) {
      setError("Speech recognition is not supported in this browser");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (!hasPermission) {
      checkMicrophoneAccess().then(hasMic => {
        setHasPermission(hasMic);
        if (!hasMic) {
          setError("Microphone permission denied");
          setTimeout(() => setError(null), 3000);
        }
      });
      return;
    }
    
    setError(null);
    setIsListening(true);
    onListening(true);
    
    const vc = startVoiceInput({
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          onTranscript(transcript);
          setIsListening(false);
          onListening(false);
          setInterimTranscript('');
          setController(null);
        } else {
          setInterimTranscript(transcript);
        }
      },
      onEnd: () => {
        setIsListening(false);
        onListening(false);
        setInterimTranscript('');
        setController(null);
      },
      onError: (err) => {
        setError(err.message);
        setTimeout(() => setError(null), 3000);
        setIsListening(false);
        onListening(false);
        setInterimTranscript('');
        setController(null);
      }
    });
    
    setController(vc);
  }, [isListening, controller, supported, hasPermission, onTranscript, onListening]);
  
  // Determine which icon to display
  const getIcon = () => {
    if (!supported || !hasPermission) {
      return <FaMicrophoneSlash />;
    }
    return isListening ? <FaStop /> : <FaMicrophone />;
  };
  
  return (
    <div className="voice-input-container">
      <button 
        className={`${buttonClass} ${isListening ? activeClass : ''} ${!supported || !hasPermission ? 'disabled' : ''}`}
        onClick={toggleListening}
        disabled={!supported || !hasPermission}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        title={
          !supported ? "Speech recognition not supported in this browser" :
          !hasPermission ? "Microphone permission needed" :
          isListening ? "Stop listening" : "Start voice input"
        }
      >
        {getIcon()}
        {isListening && <span className="voice-ripple"></span>}
      </button>
      
      {isListening && interimTranscript && (
        <div className="voice-status">
          <div className="voice-indicator">
            <div className="pulse"></div>
            <div className="pulse"></div>
            <div className="pulse"></div>
          </div>
          <div className="interim-transcript">{interimTranscript}</div>
        </div>
      )}
      
      {error && <div className="voice-error">{error}</div>}
    </div>
  );
};

export default VoiceInputButton;
