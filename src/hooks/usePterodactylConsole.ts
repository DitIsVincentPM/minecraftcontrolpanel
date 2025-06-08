import { useState, useEffect, useRef } from 'react';
import { pterodactylApi } from '../services/pterodactylApi';

interface LogEntry {
  timestamp: string;
  content: string;
}

export const usePterodactylConsole = (identifier: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!identifier) return;

    // Set up WebSocket connection for real-time logs
    const connectWebSocket = async () => {
      try {
        const ws = await pterodactylApi.createWebSocket(identifier);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.event === 'console output') {
              const newLog: LogEntry = {
                timestamp: new Date().toISOString(),
                content: data.args[0]
              };
              
              setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
            } else if (data.event === 'status') {
              // Handle status updates if needed
              console.log('Server status:', data.args[0]);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (err) => {
          setError('WebSocket connection failed');
          setConnected(false);
        };

      } catch (err) {
        setError('Failed to establish WebSocket connection');
        console.error('WebSocket connection error:', err);
        // Retry connection after 10 seconds
        setTimeout(connectWebSocket, 10000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [identifier]);

  const sendCommand = async (command: string) => {
    try {
      await pterodactylApi.sendCommand(identifier, command);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send command');
    }
  };

  return {
    logs,
    connected,
    error,
    sendCommand
  };
};