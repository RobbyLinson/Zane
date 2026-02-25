// Embedding service — singleton wrapper around @xenova/transformers
// Uses dynamic import() so this CJS file can load the ESM-only package.

let _extractor = null;

async function getExtractor() {
  if (!_extractor) {
    const { pipeline } = await import("@xenova/transformers");
    _extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return _extractor;
}

/**
 * Generate a 384-dimensional embedding for the given text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/**
 * Cosine similarity between two equal-length vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}  value in [-1, 1], higher = more similar
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

module.exports = { generateEmbedding, cosineSimilarity };
