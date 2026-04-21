import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBImA-D_ZVZaNhcXPxaRv4y9B2qNB3E3i0';

async function test() {
  const versions = ['v1', 'v1beta'];
  for (const v of versions) {
    console.log(`--- Testing version ${v} ---`);
    const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: v });
    try {
      const models = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await models.generateContent('Hi');
      console.log(`  gemini-1.5-flash works on ${v}: ${result.response.text().substring(0, 20)}...`);
    } catch (err) {
      console.log(`  gemini-1.5-flash fails on ${v}: ${err.message}`);
    }
  }
}

test();
