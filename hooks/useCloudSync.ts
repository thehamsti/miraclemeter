import { useEffect, useState } from 'react';
import {
  getCloudSyncState,
  setCloudSyncEnabled,
  subscribe,
  syncNow,
  type CloudSyncState,
} from '@/services/cloudSync';

export interface UseCloudSyncResult {
  status: CloudSyncState['status'];
  lastSyncedAt: Date | null;
  enabled: boolean;
  setEnabled: (value: boolean) => Promise<void>;
  syncNow: () => Promise<void>;
}

export function useCloudSync(): UseCloudSyncResult {
  const [state, setState] = useState<CloudSyncState>(getCloudSyncState);

  useEffect(() => subscribe(setState), []);

  return {
    status: state.status,
    lastSyncedAt: state.lastSyncedAt,
    enabled: state.enabled,
    setEnabled: setCloudSyncEnabled,
    syncNow,
  };
}
