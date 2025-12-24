// Helper functions to handle JSON arrays in SQLite

/**
 * Convert array to JSON string for storage
 */
const toJsonString = (arr) => {
  if (!arr) return '[]';
  if (typeof arr === 'string') return arr;
  return JSON.stringify(arr);
};

/**
 * Parse JSON string to array
 */
const fromJsonString = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
};

/**
 * Transform permit data for response (parse JSON strings to arrays)
 */
const transformPermitResponse = (permit) => {
  if (!permit) return permit;
  return {
    ...permit,
    hazards: fromJsonString(permit.hazards),
    precautions: fromJsonString(permit.precautions),
    equipment: fromJsonString(permit.equipment),
  };
};

/**
 * Transform permit data for storage (convert arrays to JSON strings)
 */
const transformPermitForStorage = (data) => {
  const transformed = { ...data };
  if (data.hazards !== undefined) {
    transformed.hazards = toJsonString(data.hazards);
  }
  if (data.precautions !== undefined) {
    transformed.precautions = toJsonString(data.precautions);
  }
  if (data.equipment !== undefined) {
    transformed.equipment = toJsonString(data.equipment);
  }
  return transformed;
};

module.exports = {
  toJsonString,
  fromJsonString,
  transformPermitResponse,
  transformPermitForStorage,
};
