import { TIZHI_VALIDATION } from './data.js';

function blockedError() {
  const error = new Error(TIZHI_VALIDATION.reason);
  error.code = 'TCM_CONSTITUTION_UNVALIDATED';
  return error;
}

export function assessConstitution() {
  throw blockedError();
}

export function formatForAI() {
  throw blockedError();
}
