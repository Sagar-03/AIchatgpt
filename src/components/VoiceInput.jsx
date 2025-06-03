import { useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaMicrophoneSlash } from 'react-icons/fa';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  checkMicrophonePermission 
} from '../utils/speechRecognition';

/**
 * Voice Input Component with auto-submit
 * @param {Object} props Component props
 * @param {Function} props.onInputChange Function to update input text
 * @param {Function} props.onSubmit Function to submit the transcript
 * @param {string} props.className Additional CSS classes
 */
const VoiceInput = ({ onInputChange, onSubmit, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionControl, setRecognitionControl] = useState(null);
  const [error, setError] = useState(null);

  // Check for browser support and mic permissions
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
    
    const checkPermission = async () => {
      const hasPermission = await checkMicrophonePermission();
      setHasMicPermission(hasPermission);
    };
    
    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionControl) {
        recognitionControl.abort();
      }
    };
  }, [recognitionControl]);

  /**
   * Toggle voice recognition on/off
   */
  const toggleListening = async () => {
    // Stop if already listening
    if (isListening && recognitionControl) {
      recognitionControl.stop();
      setRecognitionControl(null);
      setIsListening(false);
      setInterimTranscript('');
      return;
    }
    
    // Check permissions again if needed
    if (!hasMicPermission) {
      const hasPermission = await checkMicrophonePermission();
      setHasMicPermission(hasPermission);
      if (!hasPermission) {
        setError('Microphone permission denied');
        return;
      }
    }
    
    // Start recognition
    const control = startSpeechRecognition({
      onInterimResult: (text) => {
        setInterimTranscript(text);
        onInputChange(text); // Update input field in real-time
      },
      onFinalResult: (text) => {
        setInterimTranscript('');
        onInputChange(text); // Set final text in input field
      },
      onAutoSubmit: (text) => {
        if (text && text.trim().length > 0) {
          onSubmit(text); // Auto-submit when speech is final
        }
      },
      onError: (err) => {
        setError(err.message);
        setIsListening(false);
        setInterimTranscript('');
      },
      onStart: () => {
        setIsListening(true);
        setError(null);
      },
      onEnd: () => {
        setIsListening(false);
        setRecognitionControl(null);
      }
    });
    
    if (control) {
      setRecognitionControl(control);
    }
  };
  
  // Determine button state and icon
  const buttonDisabled = !isSupported || !hasMicPermission;
  const buttonIcon = isListening ? <FaStop /> : (buttonDisabled ? <FaMicrophoneSlash /> : <FaMicrophone />);
  const buttonTitle = !isSupported ? 'Speech recognition not supported in this browser' :
                     !hasMicPermission ? 'Microphone access required' :
                     isListening ? 'Stop listening' : 'Start voice input';
  
  return (
    <div className={`voice-input-container ${className}`}>
      <button
        className={`voice-button ${isListening ? 'active' : ''} ${buttonDisabled ? 'disabled' : ''}`}
        onClick={toggleListening}
        disabled={buttonDisabled}
        title={buttonTitle}
        aria-label={buttonTitle}
      >
        {buttonIcon}
      </button>
      
      {isListening && (
        <div className="voice-status">
          <div className="voice-indicator">
            <span className="pulse"></span>
            <span className="pulse"></span>
            <span className="pulse"></span>
          </div>
          {interimTranscript && <div className="interim-transcript">{interimTranscript}</div>}
        </div>
      )}
      
      {error && <div className="voice-error">{error}</div>}
    </div>
  );
};

export default VoiceInput;
