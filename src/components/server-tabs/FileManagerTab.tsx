import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  FolderPlus,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { usePterodactylFiles } from '../../hooks/usePterodactylFiles';

interface FileManagerTabProps {
  serverData: any;
  serverId: string;
}

export const FileManagerTab: React.FC<FileManagerTabProps> = ({ serverData, serverId }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [editingFile, setEditingFile] = useState<any>(null);
  const [editContent, setEditContent] = useState('');

  const { 
    files, 
    loading, 
    error, 
    getFileContents, 
    writeFile, 
    createDirectory, 
    deleteFiles 
  } = usePterodactylFiles(serverId, currentPath);

  const handleFileClick = async (file: any) => {
    if (file.attributes.is_file) {
      setSelectedFile(file);
      try {
        const filePath = `${currentPath}/${file.attributes.name}`.replace('//', '/');
        const content = await getFileContents(filePath);
        setSelectedFile({ ...file, content });
      } catch (err) {
        console.error('Failed to load file content:', err);
      }
    } else {
      // Navigate to directory
      const newPath = `${currentPath}/${file.attributes.name}`.replace('//', '/');
      setCurrentPath(newPath);
    }
  };

  const handleEdit = (file: any) => {
    setEditingFile(file);
    setEditContent(file.content || '');
  };

  const handleSave = async () => {
    if (editingFile) {
      try {
        const filePath = `${currentPath}/${editingFile.attributes.name}`.replace('//', '/');
        await writeFile(filePath, editContent);
        setEditingFile(null);
        setEditContent('');
        // Refresh the file content
        const updatedContent = await getFileContents(filePath);
        setSelectedFile({ ...editingFile, content: updatedContent });
      } catch (err) {
        console.error('Failed to save file:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditContent('');
  };

  const handleDelete = async (file: any) => {
    if (window.confirm(`Are you sure you want to delete "${file.attributes.name}"? This action cannot be undone.`)) {
      try {
        const filePath = `${currentPath}/${file.attributes.name}`.replace('//', '/');
        await deleteFiles([filePath]);
        setSelectedFile(null);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      setCurrentPath(parentPath);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: any) => {
    if (!file.attributes.is_file) return <Folder className="w-5 h-5 text-blue-500" />;
    
    const ext = file.attributes.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'yml':
      case 'yaml':
      case 'json':
      case 'properties':
      case 'txt':
      case 'log':
        return <File className="w-5 h-5 text-green-500" />;
      case 'jar':
        return <File className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Browser */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Files</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-mono">{currentPath}</span>
              {currentPath !== '/' && (
                <button
                  onClick={navigateUp}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto p-2">
            {files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-2" />
                <p>No files found</p>
              </div>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded-md ${
                    selectedFile?.attributes?.name === file.attributes.name ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 truncate block">{file.attributes.name}</span>
                    {file.attributes.is_file && (
                      <span className="text-xs text-gray-500">{formatFileSize(file.attributes.size)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* File Content */}
      <div className="lg:col-span-2">
        {editingFile ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Editing: {editingFile.attributes.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
            
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none"
              placeholder="File content..."
            />
          </div>
        ) : selectedFile ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedFile.attributes.name}</h3>
                  <p className="text-sm text-gray-600">
                    Size: {formatFileSize(selectedFile.attributes.size)} • Modified: {new Date(selectedFile.attributes.modified_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(selectedFile)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedFile)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {selectedFile.content !== undefined ? (
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  {selectedFile.content}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-2" />
                  <p>Loading file content...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center text-gray-500">
              <Folder className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No file selected</h3>
              <p>Select a file from the tree to view or edit its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};