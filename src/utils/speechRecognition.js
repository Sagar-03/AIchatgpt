/**
 * Speech Recognition Utility
 * Handles voice input and automatic submission to chat
 */

// Get the speech recognition interface from browser
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

// Singleton instance for speech recognition
let recognitionInstance = null;
let isListening = false;

/**
 * Check if speech recognition is supported by browser
 * @returns {boolean} True if supported
 */
export const isSpeechRecognitionSupported = () => {
  return !!SpeechRecognition;
};

/**
 * Initialize speech recognition
 * @returns {SpeechRecognition|null} Speech recognition object or null if not supported
 */
const createRecognitionInstance = () => {
  if (!isSpeechRecognitionSupported()) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  return recognition;
};

/**
 * Start voice recognition and auto-submit
 * @param {Object} options Configuration options
 * @param {Function} options.onInterimResult Callback for interim results
 * @param {Function} options.onFinalResult Callback for final result
 * @param {Function} options.onAutoSubmit Callback to auto-submit the transcript
 * @param {Function} options.onError Callback for errors
 * @param {Function} options.onStart Callback when recording starts
 * @param {Function} options.onEnd Callback when recording ends
 * @returns {Object} Control methods for speech recognition
 */
export const startSpeechRecognition = ({
  onInterimResult = () => {},
  onFinalResult = () => {},
  onAutoSubmit = () => {},
  onError = () => {},
  onStart = () => {},
  onEnd = () => {}
}) => {
  // Don't create multiple instances
  if (isListening) {
    console.log('Speech recognition is already active');
    return null;
  }

  // Create instance if not exists
  if (!recognitionInstance) {
    recognitionInstance = createRecognitionInstance();
    if (!recognitionInstance) {
      onError(new Error('Speech recognition not supported'));
      return null;
    }
  }

  // Set up event handlers
  recognitionInstance.onstart = () => {
    isListening = true;
    onStart();
    console.log('Speech recognition started');
  };

  recognitionInstance.onresult = (event) => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    const isFinal = event.results[resultIndex].isFinal;

    if (isFinal) {
      onFinalResult(transcript.trim());
      // Auto-submit the final transcript
      onAutoSubmit(transcript.trim());
    } else {
      onInterimResult(transcript.trim());
    }
  };

  recognitionInstance.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError(new Error(event.error || 'Unknown speech recognition error'));
    isListening = false;
  };

  recognitionInstance.onend = () => {
    console.log('Speech recognition ended');
    isListening = false;
    onEnd();
  };

  // Start recognition
  try {
    recognitionInstance.start();
  } catch (error) {
    console.error('Failed to start speech recognition:', error);
    onError(error);
    isListening = false;
    return null;
  }

  // Return control methods
  return {
    stop: () => {
      if (isListening && recognitionInstance) {
        recognitionInstance.stop();
      }
    },
    abort: () => {
      if (isListening && recognitionInstance) {
        recognitionInstance.abort();
      }
    },
    isListening: () => isListening
  };
};

/**
 * Check microphone permissions
 * @returns {Promise<boolean>} Whether microphone access is allowed
 */
export const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop all tracks
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission error:', error);
    return false;
  }
};
