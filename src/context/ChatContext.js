import { createContext, useState, useContext, useEffect } from 'react';
import runChat from '../config/gemini';
import {
  getConversations,
  createConversation,
  getConversationById,
  addMessageToConversation,
  deleteConversation,
  clearAllConversations
} from '../utils/chatHistory';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load conversations on mount
  useEffect(() => {
    const loadedConversations = getConversations();
    setConversations(loadedConversations);
    
    // Set current conversation to the most recent one if available
    if (loadedConversations.length > 0) {
      setCurrentConversation(loadedConversations[0]);
    } else {
      // Create a new conversation if none exists
      const newConversation = createConversation();
      setConversations([newConversation]);
      setCurrentConversation(newConversation);
    }
  }, []);

  // Create a new conversation
  const startNewConversation = () => {
    const newConversation = createConversation();
    setConversations(prevConversations => [newConversation, ...prevConversations]);
    setCurrentConversation(newConversation);
    return newConversation;
  };

  // Switch to another conversation
  const switchConversation = (conversationId) => {
    const conversation = getConversationById(conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      return true;
    }
    return false;
  };

  // Send a message and get a response
  const sendMessage = async (message) => {
    if (!currentConversation) {
      startNewConversation();
    }

    setLoading(true);
    setError(null);

    try {
      // Add user message to conversation
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      const updatedConversation = addMessageToConversation(currentConversation.id, userMessage);
      setCurrentConversation(updatedConversation);
      
      // Get response from AI using conversation history
      const aiResponse = await runChat(message, updatedConversation.messages);
      
      // Add AI response to conversation
      const aiMessage = {
        role: 'model',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      const finalConversation = addMessageToConversation(currentConversation.id, aiMessage);
      setCurrentConversation(finalConversation);
      
      // Update conversations list
      setConversations(getConversations());
      
      return { success: true, message: aiResponse };
    } catch (err) {
      setError(err.message || 'Failed to get response');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a conversation
  const removeConversation = (conversationId) => {
    const success = deleteConversation(conversationId);
    if (success) {
      const updatedConversations = getConversations();
      setConversations(updatedConversations);
      
      // If we deleted the current conversation, switch to another one
      if (currentConversation?.id === conversationId) {
        if (updatedConversations.length > 0) {
          setCurrentConversation(updatedConversations[0]);
        } else {
          const newConversation = startNewConversation();
          setCurrentConversation(newConversation);
        }
      }
      
      return true;
    }
    return false;
  };

  // Clear all conversations
  const clearAllHistory = () => {
    const success = clearAllConversations();
    if (success) {
      const newConversation = startNewConversation();
      setConversations([newConversation]);
      setCurrentConversation(newConversation);
      return true;
    }
    return false;
  };

  const value = {
    conversations,
    currentConversation,
    loading,
    error,
    sendMessage,
    startNewConversation,
    switchConversation,
    removeConversation,
    clearAllHistory
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;
