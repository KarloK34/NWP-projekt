const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 10 }); // 10 min


const HF_BASE = 'https://huggingface.co/api';

// optional token (rate limit + gated models)
function hfHeaders() {
  const token = process.env.HUGGINGFACE_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapHfDetails(data) {
  return {
    modelId: data.modelId,
    downloads: data.downloads ?? 0,
    likes: data.likes ?? 0,
    taskType: data.pipeline_tag || null,
    lastModified: data.lastModified || null,
    tags: data.tags || [],
    // možete izvući i cardData ako želite
  };
}

async function getModelDetails(modelId) {
  if (!modelId || typeof modelId !== 'string') {
    const err = new Error('Invalid modelId');
    err.statusCode = 400;
    throw err;
  }

  try {
    const key = `hf:model:${modelId}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const { data } = await axios.get(`${HF_BASE}/models/${encodeURIComponent(modelId)}`, {
      headers: hfHeaders(),
      timeout: 10000,
    });
    const mapped = mapHfDetails(data);
    cache.set(key, mapped);
    return mapped;

  } catch (e) {
    // HuggingFace vraća 404 za nepostojeći model
    if (e.response?.status === 404) {
      const err = new Error('Hugging Face model nije pronađen');
      err.statusCode = 404;
      throw err;
    }
    // rate limit / auth
    if (e.response?.status === 401 || e.response?.status === 403) {
      const err = new Error('Hugging Face: unauthorized/forbidden (provjeri token ili gated model)');
      err.statusCode = e.response.status;
      throw err;
    }
    if (e.response?.status === 429) {
      const err = new Error('Hugging Face: rate limit exceeded');
      err.statusCode = 429;
      throw err;
    }
    if (e.response?.status === 400) {
    const err = new Error('Hugging Face: Bad request (provjeri huggingFaceModelId)');
    err.statusCode = 400;
    throw err;
    }
    throw e;
  }
}

// Pretraživanje modela po tasku/pipeline_tag
// HF endpoint: GET /api/models?pipeline_tag=text-generation&limit=10
async function searchModelsByTask(taskType, limit = 10) {
  if (!taskType || typeof taskType !== 'string' || !taskType.trim()) {
  const err = new Error('Invalid taskType');
  err.statusCode = 400;
  throw err;
 }
taskType = taskType.trim();

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  try {
    const key = `hf:task:${taskType}:${safeLimit}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const { data } = await axios.get(`${HF_BASE}/models`, {
      params: {
        pipeline_tag: taskType,
        limit: safeLimit,
      },
      headers: hfHeaders(),
      timeout: 10000,
    });

    const mapped = (data || []).map((m) => ({
        modelId: m.modelId,
        downloads: m.downloads ?? 0,
        likes: m.likes ?? 0,
        taskType: m.pipeline_tag || null,
        lastModified: m.lastModified || null,
    }));

    cache.set(key, mapped);
    return mapped;

  } catch (e) {
    if (e.response?.status === 429) {
      const err = new Error('Hugging Face: rate limit exceeded');
      err.statusCode = 429;
      throw err;
    }
    throw e;
  }
}

module.exports = {
  getModelDetails,
  searchModelsByTask,
};
