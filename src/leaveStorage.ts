import type { LeaveSettings } from "./types";

const DATABASE_NAME = "leave-system-storage";
const DATABASE_VERSION = 1;
const SETTINGS_STORE = "settings";
const SETTINGS_KEY = "current-leave-settings";

/** Opens the local IndexedDB database used by desktop and mobile webviews. */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("当前设备不支持 IndexedDB"));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(SETTINGS_STORE)) {
        request.result.createObjectStore(SETTINGS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("无法打开本地存储"));
  });
}

/**
 * Validates that a persisted value includes every setting required by the application.
 *
 * @param value - The raw value retrieved from IndexedDB.
 * @returns Whether the value is a usable LeaveSettings record.
 */
function isLeaveSettings(value: unknown): value is LeaveSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Record<string, unknown>;
  return typeof settings.applicant === "string"
    && typeof settings.startDate === "string"
    && typeof settings.endDate === "string"
    && typeof settings.startPeriod === "string"
    && typeof settings.endPeriod === "string"
    && typeof settings.reason === "string"
    && typeof settings.leaveType === "string"
    && typeof settings.isBoarding === "boolean"
    && Array.isArray(settings.proofImages)
    && settings.proofImages.every((image) => typeof image === "string")
    && Array.isArray(settings.approvalRequests)
    && settings.approvalRequests.every((role) => typeof role === "string");
}

/**
 * Reads the latest saved leave settings from device-local IndexedDB.
 *
 * @returns The saved settings, or null when no valid record is available.
 */
export async function loadLeaveSettings(): Promise<LeaveSettings | null> {
  try {
    const database = await openDatabase();
    const settings = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(SETTINGS_STORE, "readonly");
      const request = transaction.objectStore(SETTINGS_STORE).get(SETTINGS_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("无法读取本地设置"));
    });
    database.close();
    return isLeaveSettings(settings) ? settings : null;
  } catch {
    return null;
  }
}

/**
 * Stores all settings and proof-image data on the current device.
 *
 * @param settings - The leave settings to retain between application launches.
 * @returns Whether the write operation completed successfully.
 */
export async function saveLeaveSettings(settings: LeaveSettings): Promise<boolean> {
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(SETTINGS_STORE, "readwrite");
      transaction.objectStore(SETTINGS_STORE).put(settings, SETTINGS_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("无法保存本地设置"));
      transaction.onabort = () => reject(transaction.error ?? new Error("本地保存已取消"));
    });
    database.close();
    return true;
  } catch {
    return false;
  }
}
