const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

/**
 * Generira AI opis alata pomoću Groq API-ja (besplatan tier, bez kartice).
 * @param {string} toolName - Naziv alata
 * @param {string} [website=''] - URL web stranice alata (opcionalno)
 * @returns {Promise<string>} - Generirani opis
 */
async function generateToolDescription(toolName, website = '') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY nije postavljen u .env. Dobijte ključ na console.groq.com');
  }

  const context = website ? ` (web: ${website})` : '';
  const prompt = `Napiši kratak profesionalni opis (2-4 rečenice, max 500 znakova) za AI alat "${toolName}"${context}. Opis treba biti na hrvatskom, informativan i bez marketing fraza. Vrati samo sam opis, bez dodatnog teksta.`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 20000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('AI nije vratio opis. Pokušajte ponovno.');
    }
    return text;
  } catch (axiosError) {
    if (axiosError.response?.status === 401) {
      throw new Error('Neispravan Groq API ključ. Provjerite GROQ_API_KEY u .env');
    }
    if (axiosError.response?.status === 429) {
      throw new Error('Previše zahtjeva. Pričekajte minutu i pokušajte ponovno.');
    }
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error('Groq API ne odgovara. Pokušajte ponovno.');
    }
    const msg = axiosError.response?.data?.error?.message || axiosError.message;
    throw new Error(msg || 'Greška pri generiranju opisa.');
  }
}

module.exports = { generateToolDescription };
