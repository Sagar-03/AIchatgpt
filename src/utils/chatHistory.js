/**
 * Chat History Management Utility
 * Handles storing, retrieving, and manipulating chat history
 */

// Use local storage as the persistence layer
const STORAGE_KEY = 'gemini_chat_history';

/**
 * Get all chat conversations from storage
 * @returns {Array} Array of conversation objects
 */
export const getConversations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
};

/**
 * Save conversations to storage
 * @param {Array} conversations - Array of conversation objects
 */
export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

/**
 * Create a new conversation
 * @param {string} title - Title of the conversation
 * @returns {Object} New conversation object
 */
export const createConversation = (title = 'New Chat') => {
  const conversation = {
    id: Date.now().toString(),
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      greetingsCount: 0,
      voiceInputsCount: 0
    }
  };
  
  const conversations = getConversations();
  conversations.unshift(conversation);
  saveConversations(conversations);
  
  return conversation;
};

/**
 * Get a conversation by ID
 * @param {string} id - Conversation ID
 * @returns {Object|null} Conversation object or null if not found
 */
export const getConversationById = (id) => {
  const conversations = getConversations();
  return conversations.find(conv => conv.id === id) || null;
};

/**
 * Add a message to a conversation
 * @param {string} conversationId - ID of the conversation
 * @param {Object} message - Message object with role and content
 * @param {Object} options - Additional options
 * @param {boolean} options.isGreeting - Whether this message is a greeting
 * @param {boolean} options.isVoiceInput - Whether this message came from voice input
 * @returns {Object|null} Updated conversation or null if failed
 */
export const addMessageToConversation = (
  conversationId, 
  message, 
  options = { isGreeting: false, isVoiceInput: false }
) => {
  const conversations = getConversations();
  const index = conversations.findIndex(conv => conv.id === conversationId);
  
  if (index === -1) return null;
  
  // Add metadata to the message
  const enhancedMessage = {
    ...message,
    isGreeting: options.isGreeting || false,
    isVoiceInput: options.isVoiceInput || false
  };
  
  conversations[index].messages.push(enhancedMessage);
  conversations[index].updatedAt = new Date().toISOString();
  
  // Update stats
  if (!conversations[index].stats) {
    conversations[index].stats = { greetingsCount: 0, voiceInputsCount: 0 };
  }
  
  if (options.isGreeting) {
    conversations[index].stats.greetingsCount++;
  }
  
  if (options.isVoiceInput) {
    conversations[index].stats.voiceInputsCount++;
  }
  
  // Auto-update title for new conversations based on first user message
  if (conversations[index].title === 'New Chat' && message.role === 'user' && conversations[index].messages.length === 1) {
    conversations[index].title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }
  
  saveConversations(conversations);
  return conversations[index];
};

/**
 * Delete a conversation
 * @param {string} conversationId - ID of the conversation to delete
 * @returns {boolean} Success status
 */
export const deleteConversation = (conversationId) => {
  const conversations = getConversations();
  const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
  
  if (filteredConversations.length === conversations.length) {
    return false;
  }
  
  saveConversations(filteredConversations);
  return true;
};

/**
 * Clear all chat history
 * @returns {boolean} Success status
 */
export const clearAllConversations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    return false;
  }
};

/**
 * Format conversation history for Gemini API
 * @param {Array} messages - Array of message objects
 * @returns {Array} Formatted history for Gemini API
 */
export const formatHistoryForGemini = (messages) => {
  return messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
};

/**
 * Get statistics about conversations
 * @returns {Object} Statistics object
 */
export const getConversationStats = () => {
  const conversations = getConversations();
  
  return {
    totalConversations: conversations.length,
    totalMessages: conversations.reduce((count, conv) => count + conv.messages.length, 0),
    greetingsCount: conversations.reduce((count, conv) => count + (conv.stats?.greetingsCount || 0), 0),
    voiceInputsCount: conversations.reduce((count, conv) => count + (conv.stats?.voiceInputsCount || 0), 0),
    averageMessagesPerConversation: conversations.length ? 
      conversations.reduce((count, conv) => count + conv.messages.length, 0) / conversations.length : 0
  };
};
