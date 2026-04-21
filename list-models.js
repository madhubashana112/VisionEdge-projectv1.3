import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBImA-D_ZVZaNhcXPxaRv4y9B2qNB3E3i0';

async function test() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log('Available models:', JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (err) {
    console.log('Error listing models:', err.message);
  }
}

test();
