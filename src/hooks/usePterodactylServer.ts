import { useState, useEffect } from 'react';
import { pterodactylApi, PterodactylServer, ServerStats } from '../services/pterodactylApi';

export const usePterodactylServer = (identifier: string) => {
  const [server, setServer] = useState<PterodactylServer | null>(null);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    const fetchServerData = async () => {
      try {
        setLoading(true);
        const [serverData, statsData] = await Promise.all([
          pterodactylApi.getServer(identifier),
          pterodactylApi.getServerStats(identifier)
        ]);
        
        setServer(serverData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch server data');
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();

    // Set up periodic stats updates
    const interval = setInterval(async () => {
      try {
        const statsData = await pterodactylApi.getServerStats(identifier);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to update stats:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [identifier]);

  const startServer = async () => {
    try {
      await pterodactylApi.startServer(identifier);
      // Stats will be updated by the interval
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start server');
    }
  };

  const stopServer = async () => {
    try {
      await pterodactylApi.stopServer(identifier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop server');
    }
  };

  const restartServer = async () => {
    try {
      await pterodactylApi.restartServer(identifier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart server');
    }
  };

  return {
    server,
    stats,
    loading,
    error,
    startServer,
    stopServer,
    restartServer
  };
};