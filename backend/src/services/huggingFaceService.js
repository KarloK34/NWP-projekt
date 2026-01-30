const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 10 }); // 10 min

const HF_BASE = 'https://huggingface.co/api';

// optional token (rate limit + gated models)
function hfHeaders() {
  const token = process.env.HUGGINGFACE_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  searchModelsByTask,
};
