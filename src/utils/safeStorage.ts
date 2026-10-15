type StorageKind = "local" | "session";
type StorageOperation = "access" | "getItem" | "setItem" | "removeItem" | "clear";

const memoryStorage: Record<StorageKind, Map<string, string>> = {
  local: new Map<string, string>(),
  session: new Map<string, string>(),
};

const reportedStorageErrors = new Set<string>();

function reportStorageError(
  operation: StorageOperation,
  kind: StorageKind,
  error: unknown,
) {
  const reportKey = `${operation}:${kind}`;
  if (reportedStorageErrors.has(reportKey)) return;

  reportedStorageErrors.add(reportKey);
  console.warn(`[safeStorage] Native ${kind} storage ${operation} failed`, error);
}

function getNativeStorage(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch (error) {
    reportStorageError("access", kind, error);
    return null;
  }
}

export function getStorageItem(
  key: string,
  kind: StorageKind = "local",
): string | null {
  const storage = getNativeStorage(kind);
  if (!storage) return memoryStorage[kind].get(key) ?? null;

  try {
    return storage.getItem(key);
  } catch (error) {
    reportStorageError("getItem", kind, error);
    return memoryStorage[kind].get(key) ?? null;
  }
}

export function setStorageItem(
  key: string,
  value: string,
  kind: StorageKind = "local",
) {
  const storage = getNativeStorage(kind);
  if (!storage) {
    memoryStorage[kind].set(key, value);
    return;
  }

  try {
    storage.setItem(key, value);
  } catch (error) {
    reportStorageError("setItem", kind, error);
    memoryStorage[kind].set(key, value);
  }
}

export function removeStorageItem(key: string, kind: StorageKind = "local") {
  const storage = getNativeStorage(kind);
  if (!storage) {
    memoryStorage[kind].delete(key);
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    reportStorageError("removeItem", kind, error);
    memoryStorage[kind].delete(key);
  }
}
