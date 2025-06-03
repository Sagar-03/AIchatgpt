// node --version # Should be >= 18
// npm install @google/generative-ai@latest

import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatHistoryForGemini } from "../utils/chatHistory";

// Your API key - consider using environment variables in production
const API_KEY = "AIzaSyBCirDaj4WFqUrij5mRnqiV29r6qFWPeSw";

// Available models in order of preference
const AVAILABLE_MODELS = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-pro-vision"
];

// Rate limiting setup
const RATE_LIMIT = {
  requestsInLastMinute: 0,
  lastResetTime: Date.now(),
  isRateLimited: false,
  rateLimitEndTime: null,
  modelQuotaStatus: {}
};

// Reset counters periodically
setInterval(() => {
  RATE_LIMIT.requestsInLastMinute = 0;
  RATE_LIMIT.lastResetTime = Date.now();
}, 60000);

/**
 * Check if the prompt is a simple greeting
 * @param {string} prompt - User input to check
 * @returns {string|null} Greeting response or null if not a greeting
 */
function checkForGreeting(prompt) {
  const input = prompt.toLowerCase().trim();
  
  // Time-based greeting patterns
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 17;
  const isEvening = currentHour >= 17 || currentHour < 5;
  
  // Simple greeting patterns
  const morningPatterns = ['good morning', 'morning', 'gm'];
  const afternoonPatterns = ['good afternoon', 'afternoon', 'ga'];
  const eveningPatterns = ['good evening', 'evening', 'good night', 'night', 'ge', 'gn'];
  const generalGreetings = ['hello', 'hi', 'hey', 'greetings', 'howdy', 'sup', 'whats up', "what's up", 'yo'];
  
  // Check for time-specific greetings
  if (morningPatterns.some(pattern => input.includes(pattern))) {
    return `Good morning! How can I assist you today? ${isMorning ? '☀️' : ''}`;
  }
  
  if (afternoonPatterns.some(pattern => input.includes(pattern))) {
    return `Good afternoon! How can I help you? ${isAfternoon ? '🌤️' : ''}`;
  }
  
  if (eveningPatterns.some(pattern => input.includes(pattern))) {
    return `Good evening! How may I assist you? ${isEvening ? '🌙' : ''}`;
  }
  
  // Check for general greetings
  if (generalGreetings.some(pattern => input === pattern || input.startsWith(pattern + ' '))) {
    if (isMorning) {
      return 'Good morning! How can I help you today? ☀️';
    } else if (isAfternoon) {
      return 'Good afternoon! How can I assist you? 🌤️';
    } else {
      return 'Good evening! How may I help you? 🌙';
    }
  }
  
  return null;
}

/**
 * Check if the input is from speech recognition
 * @param {string} prompt - User input to check
 * @returns {boolean} True if it appears to be from voice input
 */
function isVoiceInput(prompt) {
  // Common indicators of voice input
  return prompt.startsWith('Voice input: ') || 
         prompt.startsWith('Transcription: ') ||
         prompt.startsWith('Speech: ') ||
         prompt.includes('[voice]') ||
         prompt.includes('[mic]') ||
         // Check for common speech recognition errors/artifacts
         prompt.includes('listening') ||
         /^(ok|okay|hey|hi)[\s,]+(siri|google|alexa)/i.test(prompt);
}

/**
 * Clean up voice input text
 * @param {string} prompt - Voice input to clean
 * @returns {string} Cleaned input
 */
function cleanVoiceInput(prompt) {
  // Remove voice indicators
  let cleaned = prompt.replace(/^(Voice input:|Transcription:|Speech:|\[voice\]|\[mic\])/i, '').trim();
  
  // Remove common voice activation phrases
  cleaned = cleaned.replace(/^(ok|okay|hey|hi)[\s,]+(siri|google|alexa)/i, '').trim();
  
  // Fix common voice recognition errors
  cleaned = cleaned.replace(/period$/i, '.').trim();
  cleaned = cleaned.replace(/question mark$/i, '?').trim();
  cleaned = cleaned.replace(/exclamation point|exclamation mark$/i, '!').trim();
  
  return cleaned;
}

/**
 * Run chat with Gemini API
 * @param {string} prompt - Current prompt to send
 * @param {Array} history - Previous messages in the conversation
 * @param {boolean} isVoice - Whether this input came from voice recognition
 * @returns {Promise<string>} Response from the AI
 */
async function runChat(prompt, history = [], isVoice = false) {
  try {
    // Handle voice input
    if (isVoice || isVoiceInput(prompt)) {
      console.log("Voice input detected:", prompt);
      prompt = cleanVoiceInput(prompt);
      console.log("Cleaned voice input:", prompt);
    }
    
    // Check for simple greetings first - bypass API for efficiency
    const greetingResponse = checkForGreeting(prompt);
    if (greetingResponse) {
      console.log("Greeting detected, providing local response:", greetingResponse);
      return greetingResponse;
    }
    
    // Check if we're currently rate limited globally
    if (RATE_LIMIT.isRateLimited && Date.now() < RATE_LIMIT.rateLimitEndTime) {
      const waitTime = Math.ceil((RATE_LIMIT.rateLimitEndTime - Date.now()) / 1000);
      return `Rate limit in effect. Please try again in ${waitTime} seconds.`;
    }
    
    // Increment request counter
    RATE_LIMIT.requestsInLastMinute++;
    
    // Simple global rate limiting
    if (RATE_LIMIT.requestsInLastMinute > 10) {
      RATE_LIMIT.isRateLimited = true;
      RATE_LIMIT.rateLimitEndTime = Date.now() + 60000;
      return "Too many requests in a short period. Please try again in a minute.";
    }
    
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Format history for Gemini API if provided
    const formattedHistory = history.length > 0 ? formatHistoryForGemini(history) : [];

    // Common configuration
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
    
    // Try models in order until one works
    for (const modelName of AVAILABLE_MODELS) {
      // Skip models we know are in quota limit
      if (RATE_LIMIT.modelQuotaStatus[modelName] && 
          Date.now() < RATE_LIMIT.modelQuotaStatus[modelName]) {
        console.log(`Skipping ${modelName} - in quota limit`);
        continue;
      }
      
      try {
        console.log(`Attempting to use model: ${modelName}`);
        
        // Get the model
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Start a chat with history if available
        const chat = model.startChat({
          generationConfig,
          history: formattedHistory,
        });
        
        // Send the message
        const result = await chat.sendMessage(prompt);
        const response = result.response;
        
        // Success!
        console.log(`Successfully used ${modelName}`);
        return response.text();
      } 
      catch (error) {
        console.error(`Error with model ${modelName}:`, error);
        
        // Handle quota errors specifically
        if (error.message?.includes("429") || 
            error.message?.includes("quota") || 
            error.message?.includes("rate limit")) {
          
          // Mark this model as quota limited
          const retryMatch = error.message.match(/retryDelay:"(\d+)s"/);
          const retryDelay = retryMatch && retryMatch[1] ? 
                            parseInt(retryMatch[1], 10) * 1000 : 
                            60000; // Default 60 seconds if not specified
          
          RATE_LIMIT.modelQuotaStatus[modelName] = Date.now() + retryDelay;
          
          // Continue to next model
          continue;
        }
        
        // If error is not quota-related, but model is not found, continue to next model
        if (error.message?.includes("404") || 
            error.message?.includes("not found") || 
            error.message?.includes("not supported")) {
          continue;
        }
        
        // For other errors, rethrow
        throw error;
      }
    }
    
    // If we get here, all models failed
    throw new Error("All models failed: " + 
      AVAILABLE_MODELS.map(model => 
        `${model}: ${RATE_LIMIT.modelQuotaStatus[model] ? 
          `In quota limit for ${Math.ceil((RATE_LIMIT.modelQuotaStatus[model] - Date.now())/1000)} more seconds` : 
          "Error or unavailable"}`
      ).join("; "));
    
  } catch (error) {
    console.error("Error with Gemini API:", error);
    
    // Better user-facing error messages
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return "You've reached the free tier API quota limit. Please try again in a minute or upgrade to a paid tier.";
    }
    
    if (error.message?.includes("API Key not found") || error.message?.includes("API_KEY_INVALID")) {
      return "Your API key is invalid or missing. Please check it again.";
    }
    
    if (error.message?.includes("All models failed")) {
      return "All available models are currently unavailable due to quota limits or other issues. Please try again in a few minutes.";
    }
    
    return "There was an error processing your request. Please try again later.";
  }
}

export default runChat;