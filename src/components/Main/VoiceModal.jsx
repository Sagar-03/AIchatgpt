import React from 'react';
import './VoiceModal.css';
import { FaMicrophone, FaVolumeMute, FaPaperPlane } from 'react-icons/fa';

const VoiceModal = ({ 
  isVisible, 
  listening, 
  transcript, 
  onCancel, 
  onSubmit 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="voice-modal-overlay" onClick={onCancel}>
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
          <button className="voice-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="voice-modal-submit"
            onClick={onSubmit}
            disabled={!transcript.trim()}
          >
            Submit <FaPaperPlane size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;