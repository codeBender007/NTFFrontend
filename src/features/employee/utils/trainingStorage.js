const SCHEDULE_STORAGE_KEY_PREFIX = "ntf_training_schedule_";

/**
 * Save training schedule sheet data for a specific employee
 */
export function saveTrainingSchedule(userEmail, scheduleData) {
  try {
    const key = `${SCHEDULE_STORAGE_KEY_PREFIX}${(userEmail || "default").toLowerCase()}`;
    const payload = {
      ...scheduleData,
      submitted: true,
      savedAt: new Date().toISOString(),
      displayDate: new Date().toLocaleString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.error("Failed to save training schedule to localStorage", e);
    return null;
  }
}

/**
 * Retrieve saved training schedule data
 */
export function getTrainingSchedule(userEmail) {
  try {
    const key = `${SCHEDULE_STORAGE_KEY_PREFIX}${(userEmail || "default").toLowerCase()}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Reset / clear training schedule data for demo
 */
export function resetTrainingSchedule(userEmail) {
  try {
    const key = `${SCHEDULE_STORAGE_KEY_PREFIX}${(userEmail || "default").toLowerCase()}`;
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("Failed to reset training schedule", e);
    return false;
  }
}
