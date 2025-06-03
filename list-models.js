// Test file to list available models
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  try {
    const API_KEY = 'AIzaSyBCirDaj4WFqUrij5mRnqiV29r6qFWPeSw';
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('Testing available models:');
    
    // Current models as of mid-2023
    const modelTests = [
      { name: 'gemini-1.5-pro', version: 'v1' },
      { name: 'gemini-1.5-flash', version: 'v1' },
      { name: 'gemini-1.0-pro', version: 'v1' },
      { name: 'gemini-pro', version: 'v1beta' },
      { name: 'gemini-pro-vision', version: 'v1beta' }
    ];
    
    console.log('\nTesting models with appropriate versions:');
    for (const { name, version } of modelTests) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: name,
          apiVersion: version
        });
        
        // Try a simple generation to verify the model works
        const prompt = "Hello, can you respond with just the word 'test'?";
        const result = await model.generateContent(prompt);
        const text = result.response?.text?.();
        
        console.log(`✅ Model ${name} (${version}): SUCCESS`);
        console.log(`   Sample response: "${text?.substring(0, 20)}..."`);
      } catch (e) {
        console.error(`❌ Model ${name} (${version}): FAILED`);
        console.error(`   Error: ${e.message}`);
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (e) {
    console.error('Error:', e);
  }
}

// Run the test
console.log('Starting model availability test...');
listModels()
  .then(() => console.log('Model testing complete'))
  .catch(e => console.error('Unhandled error:', e));
