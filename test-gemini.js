// Test file for Gemini API
import runChat from './src/config/gemini.js';

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('Before calling runChat');
    const response = await runChat('Hello, how are you?');
    console.log('After calling runChat');
    console.log('Response received:', response ? 'Yes' : 'No');
    console.log('Response length:', response?.length || 0);
    console.log('Response type:', typeof response);
    console.log('Response value:', response);
  } catch (error) {
    console.error('Error occurred:', error.message);
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
  }
}

// Make sure the promise rejection is handled
testGemini().catch(err => {
  console.error('Unhandled promise rejection:', err);
});
