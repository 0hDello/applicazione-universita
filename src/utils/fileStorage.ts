// IndexedDB File Storage for University App
const DB_NAME = 'UniPlannerFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredFileRecord {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  data: Blob | ArrayBuffer | string;
  createdAt: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save a File or Blob into IndexedDB and return its generated or provided fileId
 */
export const storeFile = async (
  fileId: string,
  file: File | Blob,
  fileName?: string
): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredFileRecord = {
      id: fileId,
      name: fileName || (file instanceof File ? file.name : 'document'),
      type: file.type || 'application/octet-stream',
      size: file.size,
      data: file,
      createdAt: Date.now(),
    };

    const req = store.put(record);
    req.onsuccess = () => resolve(fileId);
    req.onerror = () => reject(req.error);
  });
};

/**
 * Retrieve a stored file from IndexedDB by fileId
 */
export const getStoredFile = async (fileId: string): Promise<Blob | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);

      req.onsuccess = () => {
        const result = req.result as StoredFileRecord | undefined;
        if (!result) {
          resolve(null);
          return;
        }
        if (result.data instanceof Blob) {
          resolve(result.data);
        } else if (result.data instanceof ArrayBuffer) {
          resolve(new Blob([result.data], { type: result.type }));
        } else if (typeof result.data === 'string' && result.data.startsWith('data:')) {
          // Convert dataURL to Blob
          const arr = result.data.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || result.type;
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          resolve(new Blob([u8arr], { type: mime }));
        } else {
          resolve(new Blob([result.data], { type: result.type }));
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error fetching file from IndexedDB:', err);
    return null;
  }
};

/**
 * Delete a stored file from IndexedDB
 */
export const deleteStoredFile = async (fileId: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Error deleting file from IndexedDB:', e);
  }
};

/**
 * Convert a File into a Data URL (base64)
 */
export const fileToDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
