/**
 * Voice Input Utility
 * Handles speech recognition and transcription
 */

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

/**
 * Check if speech recognition is supported
 * @returns {boolean} True if supported
 */
export const isSpeechRecognitionSupported = () => {
  return !!SpeechRecognition;
};

/**
 * Initialize speech recognition
 * @param {object} options - Configuration options
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {boolean} options.continuous - Whether to continue listening after results (default: false)
 * @param {boolean} options.interimResults - Whether to return interim results (default: true)
 * @returns {SpeechRecognition|null} Speech recognition instance or null if not supported
 */
export const initSpeechRecognition = (options = {}) => {
  if (!isSpeechRecognitionSupported()) {
    console.error('Speech recognition is not supported in this browser');
    return null;
  }
  
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true
  } = options;
  
  try {
    const recognition = new SpeechRecognition();
    
    // Configure the speech recognition
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    
    return recognition;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return null;
  }
};

/**
 * Start listening for voice input
 * @param {object} callbacks - Callback functions
 * @param {function} callbacks.onResult - Called with transcript when results are available
 * @param {function} callbacks.onEnd - Called when recognition ends
 * @param {function} callbacks.onError - Called when an error occurs
 * @returns {object} Control methods { start, stop, abort }
 */
export const startVoiceInput = (callbacks = {}) => {
  const {
    onResult = () => {},
    onEnd = () => {},
    onError = () => {}
  } = callbacks;
  
  const recognition = initSpeechRecognition();
  
  if (!recognition) {
    onError(new Error('Speech recognition not supported'));
    return null;
  }
  
  // Set up event handlers
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ');
    
    const isFinal = event.results[0].isFinal;
    
    onResult(transcript, isFinal);
  };
  
  recognition.onerror = (event) => {
    onError(new Error(event.error || 'Unknown speech recognition error'));
  };
  
  recognition.onend = () => {
    onEnd();
  };
  
  // Start listening
  try {
    recognition.start();
    console.log("Voice recognition started");
  } catch (error) {
    onError(error);
    return null;
  }
  
  // Return control methods
  return {
    stop: () => {
      try {
        recognition.stop();
        console.log("Voice recognition stopped");
      } catch (e) {
        console.error("Error stopping voice recognition:", e);
      }
    },
    abort: () => {
      try {
        recognition.abort();
        console.log("Voice recognition aborted");
      } catch (e) {
        console.error("Error aborting voice recognition:", e);
      }
    }
  };
};

/**
 * Check if microphone is accessible
 * @returns {Promise<boolean>} Promise resolving to true if microphone is accessible
 */
export const checkMicrophoneAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately after checking
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone access error:', error);
    return false;
  }
};

/**
 * Get list of available audio input devices
 * @returns {Promise<MediaDeviceInfo[]>} List of audio input devices
 */
export const getAudioInputDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  } catch (error) {
    console.error('Error listing audio devices:', error);
    return [];
  }
};
