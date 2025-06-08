import { useState, useEffect } from 'react';
import { pterodactylApi, FileObject } from '../services/pterodactylApi';

export const usePterodactylFiles = (identifier: string, currentPath: string = '/') => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fileList = await pterodactylApi.getFiles(identifier, currentPath);
        setFiles(fileList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [identifier, currentPath]);

  const getFileContents = async (filePath: string): Promise<string> => {
    try {
      return await pterodactylApi.getFileContents(identifier, filePath);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get file contents');
    }
  };

  const writeFile = async (filePath: string, contents: string): Promise<void> => {
    try {
      await pterodactylApi.writeFile(identifier, filePath, contents);
      // Refresh file list
      const fileList = await pterodactylApi.getFiles(identifier, currentPath);
      setFiles(fileList);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to write file');
    }
  };

  const createDirectory = async (name: string): Promise<void> => {
    try {
      await pterodactylApi.createDirectory(identifier, name, currentPath);
      // Refresh file list
      const fileList = await pterodactylApi.getFiles(identifier, currentPath);
      setFiles(fileList);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create directory');
    }
  };

  const deleteFiles = async (filePaths: string[]): Promise<void> => {
    try {
      await pterodactylApi.deleteFiles(identifier, filePaths);
      // Refresh file list
      const fileList = await pterodactylApi.getFiles(identifier, currentPath);
      setFiles(fileList);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete files');
    }
  };

  return {
    files,
    loading,
    error,
    getFileContents,
    writeFile,
    createDirectory,
    deleteFiles
  };
};