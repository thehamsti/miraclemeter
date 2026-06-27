import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
  type NativeModule,
} from 'react-native';
import type { BirthRecord } from '@/types';

// ICloudSyncBridge is only present on iOS after a native rebuild; undefined on
// JS-only OTA updates or non-iOS platforms. Every call is guarded so sync
// silently no-ops until the native module is available.
interface ICloudSyncBridgeNative {
  isAvailable(): Promise<boolean>;
  readAll(): Promise<string | null>;
  writeAll(json: string): Promise<boolean>;
}

const ICloudSyncBridge = (
  NativeModules as { ICloudSyncBridge?: ICloudSyncBridgeNative }
).ICloudSyncBridge;

const SCHEMA_VERSION = 1;
const PUSH_DEBOUNCE_MS = 1500;

const SYNC_ENABLED_KEY = 'icloud_sync_enabled';
const DEVICE_ID_KEY = '_cloud_device_id';
const LAST_SYNCED_KEY = '_cloud_sync_last_synced';
const BIRTH_RECORDS_KEY = 'birth_records'; // mirrors storage.ts STORAGE_KEY
const APP_VERSION_KEY = 'app_version'; // install metadata, must not sync

// Sync is on by default; absence of the key means enabled.
const EXCLUDED_KEYS = new Set<string>([APP_VERSION_KEY, SYNC_ENABLED_KEY]);

export type CloudSyncStatus =
  | 'unknown'
  | 'synced'
  | 'syncing'
  | 'disabled'
  | 'no-icloud'
  | 'error';

export interface CloudSyncState {
  status: CloudSyncStatus;
  lastSyncedAt: Date | null;
  enabled: boolean;
}

interface CloudStateBlob {
  schemaVersion: number;
  deviceId: string;
  lastModified: string;
  keys: Record<string, string>;
}

type MergeSideEffect = () => Promise<void>;

let state: CloudSyncState = {
  status: 'unknown',
  lastSyncedAt: null,
  enabled: true,
};

const subscribers = new Set<(state: CloudSyncState) => void>();
let mergeSideEffects: MergeSideEffect | null = null;
let bootstrapped = false;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let appStateSub: ReturnType<typeof AppState.addEventListener> | null = null;
let eventEmitter: NativeEventEmitter | null = null;
let onChangeSub: ReturnType<NativeEventEmitter['addListener']> | null = null;

// MARK: - Public state access

export function getCloudSyncState(): CloudSyncState {
  return state;
}

export function subscribe(cb: (state: CloudSyncState) => void): () => void {
  subscribers.add(cb);
  cb(state);
  return () => {
    subscribers.delete(cb);
  };
}

export function registerMergeSideEffects(fn: MergeSideEffect): void {
  mergeSideEffects = fn;
}

function setState(next: CloudSyncState): void {
  state = next;
  for (const cb of subscribers) cb(state);
}

function patch(partial: Partial<CloudSyncState>): void {
  setState({ ...state, ...partial });
}

// MARK: - Native guards

function nativePresent(): boolean {
  return Platform.OS === 'ios' && !!ICloudSyncBridge;
}

async function isAvailable(): Promise<boolean> {
  if (!nativePresent()) return false;
  try {
    return await ICloudSyncBridge!.isAvailable();
  } catch (error) {
    console.error('cloudSync: isAvailable failed', error);
    return false;
  }
}

async function getEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(SYNC_ENABLED_KEY);
  return value === null ? true : value === 'true';
}

function isExcludedKey(key: string): boolean {
  return key.startsWith('_cloud_') || EXCLUDED_KEYS.has(key);
}

function safeParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// MARK: - Record merge (union by id, newer wins, tombstones propagate)

/**
 * Pure union merge of birth record arrays. For each id the newer record wins,
 * where "newer" uses deletedAt (tombstone) then updatedAt then timestamp. A
 * tombstone therefore persists unless the other side has a strictly newer
 * non-deleted record (resurrection).
 */
export function mergeRecords(local: BirthRecord[], remote: BirthRecord[]): BirthRecord[] {
  const byId = new Map<string, BirthRecord>();
  for (const record of local) byId.set(record.id, record);
  for (const record of remote) {
    const existing = byId.get(record.id);
    if (!existing || recordTime(record) >= recordTime(existing)) {
      byId.set(record.id, record);
    }
  }
  return Array.from(byId.values());
}

function recordTime(record: BirthRecord): number {
  if (record.deletedAt) {
    const t = Date.parse(record.deletedAt);
    if (!Number.isNaN(t)) return t;
  }
  if (record.updatedAt) {
    const t = Date.parse(record.updatedAt);
    if (!Number.isNaN(t)) return t;
  }
  if (record.timestamp) {
    const t = Date.parse(new Date(record.timestamp).toISOString());
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

// MARK: - Serialize / push

async function serializeAll(): Promise<CloudStateBlob> {
  const allKeys = (await AsyncStorage.getAllKeys()).filter(
    (key) => !isExcludedKey(key),
  );
  const pairs = await AsyncStorage.multiGet(allKeys);
  const keys: Record<string, string> = {};
  for (const [key, value] of pairs) {
    if (value !== null) keys[key] = value;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    deviceId: await getOrCreateDeviceId(),
    lastModified: new Date().toISOString(),
    keys,
  };
}

/**
 * Debounced trigger invoked by every storage write. Coalesces rapid writes into
 * a single push. No-ops when sync is disabled or iCloud is unavailable.
 */
export function markCloudDirty(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void flushPush();
  }, PUSH_DEBOUNCE_MS);
}

async function flushPush(): Promise<void> {
  if (!(await getEnabled())) return;
  if (!(await isAvailable())) return;
  try {
    patch({ status: 'syncing' });
    const blob = await serializeAll();
    await ICloudSyncBridge!.writeAll(JSON.stringify(blob));
    await AsyncStorage.setItem(LAST_SYNCED_KEY, blob.lastModified);
    patch({ status: 'synced', lastSyncedAt: new Date(blob.lastModified) });
  } catch (error) {
    console.error('cloudSync: push failed', error);
    patch({ status: 'error' });
  }
}

// MARK: - Pull / merge

async function applyRemoteBlob(remote: CloudStateBlob): Promise<void> {
  if (remote.schemaVersion > SCHEMA_VERSION) {
    console.warn(
      `cloudSync: remote schema v${remote.schemaVersion} is newer than local v${SCHEMA_VERSION}; skipping merge`,
    );
    return;
  }

  const lastSynced = await AsyncStorage.getItem(LAST_SYNCED_KEY);
  if (lastSynced && remote.lastModified === lastSynced) return;

  let recordsChanged = false;
  const remoteRecordsRaw = remote.keys[BIRTH_RECORDS_KEY];
  if (remoteRecordsRaw) {
    const remoteRecords = safeParse<BirthRecord[]>(remoteRecordsRaw);
    if (remoteRecords) {
      const localRaw = await AsyncStorage.getItem(BIRTH_RECORDS_KEY);
      const localRecords = localRaw ? safeParse<BirthRecord[]>(localRaw) ?? [] : [];
      const merged = mergeRecords(localRecords, remoteRecords);
      const mergedJson = JSON.stringify(merged);
      if (mergedJson !== localRaw) {
        await AsyncStorage.setItem(BIRTH_RECORDS_KEY, mergedJson);
        recordsChanged = true;
      }
    }
  }

  for (const [key, value] of Object.entries(remote.keys)) {
    if (key === BIRTH_RECORDS_KEY || isExcludedKey(key)) continue;
    await AsyncStorage.setItem(key, value);
  }

  await AsyncStorage.setItem(LAST_SYNCED_KEY, remote.lastModified);

  if (recordsChanged) {
    try {
      await mergeSideEffects?.();
    } catch (error) {
      console.error('cloudSync: merge side effects failed', error);
    }
  }
}

async function pullAndMerge(): Promise<void> {
  if (!(await getEnabled())) return;
  if (!(await isAvailable())) return;
  try {
    patch({ status: 'syncing' });
    const remoteRaw = await ICloudSyncBridge!.readAll();
    if (!remoteRaw) {
      const stored = await AsyncStorage.getItem(LAST_SYNCED_KEY);
      patch({
        status: 'synced',
        lastSyncedAt: stored ? new Date(stored) : null,
      });
      return;
    }
    const remote = safeParse<CloudStateBlob>(remoteRaw);
    if (!remote) return;
    await applyRemoteBlob(remote);
    patch({ status: 'synced', lastSyncedAt: new Date(remote.lastModified) });
  } catch (error) {
    console.error('cloudSync: pull failed', error);
    patch({ status: 'error' });
  }
}

// MARK: - Subscriptions

function ensureAppStateListener(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') void pullAndMerge();
  });
}

function ensureChangeSubscription(): void {
  if (!nativePresent() || onChangeSub) return;
  // RCTEventEmitter subclasses expose addListener/removeListeners at runtime;
  // cast to the NativeModule shape NativeEventEmitter expects.
  eventEmitter = new NativeEventEmitter(ICloudSyncBridge as unknown as NativeModule);
  onChangeSub = eventEmitter.addListener('onChange', () => {
    void pullAndMerge();
  });
}

async function localHasUserData(): Promise<boolean> {
  const keys = await AsyncStorage.getAllKeys();
  return keys.some((key) => !isExcludedKey(key));
}

// MARK: - Bootstrap

export async function bootstrapCloudSync(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  const enabled = await getEnabled();
  if (!enabled) {
    patch({ status: 'disabled', enabled: false });
    return;
  }
  patch({ enabled: true });

  if (!(await isAvailable())) {
    patch({ status: 'no-icloud' });
    return;
  }

  ensureAppStateListener();
  ensureChangeSubscription();

  try {
    patch({ status: 'syncing' });
    const remoteRaw = await ICloudSyncBridge!.readAll();
    const remote = remoteRaw ? safeParse<CloudStateBlob>(remoteRaw) : null;
    const localHasData = await localHasUserData();

    if (!remote) {
      if (localHasData) {
        const blob = await serializeAll();
        await ICloudSyncBridge!.writeAll(JSON.stringify(blob));
        await AsyncStorage.setItem(LAST_SYNCED_KEY, blob.lastModified);
        patch({ status: 'synced', lastSyncedAt: new Date(blob.lastModified) });
      } else {
        patch({ status: 'synced', lastSyncedAt: null });
      }
    } else if (!localHasData) {
      await applyRemoteBlob(remote);
      patch({ status: 'synced', lastSyncedAt: new Date(remote.lastModified) });
    } else {
      await applyRemoteBlob(remote);
      const blob = await serializeAll();
      await ICloudSyncBridge!.writeAll(JSON.stringify(blob));
      await AsyncStorage.setItem(LAST_SYNCED_KEY, blob.lastModified);
      patch({ status: 'synced', lastSyncedAt: new Date(blob.lastModified) });
    }
  } catch (error) {
    console.error('cloudSync: bootstrap failed', error);
    patch({ status: 'error' });
  }
}

// MARK: - Manual controls (used by Settings UI)

export async function setCloudSyncEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    patch({ status: 'syncing', enabled: true });
    ensureChangeSubscription();
    void flushPush();
  } else {
    if (onChangeSub) {
      onChangeSub.remove();
      onChangeSub = null;
    }
    patch({ status: 'disabled', enabled: false });
  }
}

export async function syncNow(): Promise<void> {
  if (!(await getEnabled())) return;
  if (!(await isAvailable())) {
    patch({ status: 'no-icloud' });
    return;
  }
  try {
    patch({ status: 'syncing' });
    const remoteRaw = await ICloudSyncBridge!.readAll();
    const remote = remoteRaw ? safeParse<CloudStateBlob>(remoteRaw) : null;
    if (remote) await applyRemoteBlob(remote);
    const blob = await serializeAll();
    await ICloudSyncBridge!.writeAll(JSON.stringify(blob));
    await AsyncStorage.setItem(LAST_SYNCED_KEY, blob.lastModified);
    patch({ status: 'synced', lastSyncedAt: new Date(blob.lastModified) });
  } catch (error) {
    console.error('cloudSync: syncNow failed', error);
    patch({ status: 'error' });
  }
}

export type {
  ICloudSyncBridgeNative,
  CloudStateBlob,
  MergeSideEffect,
};
