import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';
import { FileType, RenameTrainingMaterial } from '../../types/TrainingMaterials.types.ts';

export const fetchTrainingMaterials = async () => {
  const response = await fetch(`${BASE_API_URL}/training/training-materials`, {
    headers: {
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch training materials: ${response.status}`);
  }

  const data = await response.json();

  return data.map((item: FileType) => ({
    key: item.id.toString(),
    name: item.name,
    isDirectory: item.is_directory,
    size: 0,
    url: item.signed_url || null,
    updatedAt: item.updated_at,
    path: item.path,
  }));
};

export const createTrainingFolder = async (folderName: string, parentPath: string) => {
  const fullPath = parentPath.endsWith('/')
    ? `${parentPath}${folderName}`
    : `${parentPath}/${folderName}`;
  const response = await fetch(`${BASE_API_URL}/training/training-materials/folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({
      folderName,
      parentPath: fullPath,
      isDirectory: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.statusText}`);
  }

  const newFolder = await response.json();
  return {
    ...newFolder,
    key: newFolder.id.toString(),
    name: folderName,
    isDirectory: true,
    path: fullPath,
    updatedAt: new Date().toISOString(),
  };
};

export const renameTrainingMaterial = async ({
  fileId,
  newName,
  isDirectory,
  path,
}: RenameTrainingMaterial) => {
  const response = await fetch(`${BASE_API_URL}/training/training-materials/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({
      fileId,
      newName,
      isDirectory,
      path,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to rename: ${response.status} ${response.statusText}`);
  }

  return true;
};

export const deleteTrainingMaterials = async (files: FileType[]) => {
  const response = await fetch(`${BASE_API_URL}/training/training-materials/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({
      fileIds: files.map((file: FileType) => file.key),
      paths: files.map((file: FileType) => file.path),
      isDirectory: files[0]?.isDirectory,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete materials: ${response.status} ${response.statusText}`);
  }

  return true;
};

export const pasteTrainingMaterials = async (
  files: FileType[],
  destinationPath: string,
  operationType: string,
) => {
  const response = await fetch(`${BASE_API_URL}/training/training-materials/paste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({
      fileIds: files.map((file: FileType) => file.key),
      sourcePaths: files.map((file: FileType) => file.path),
      destinationPath,
      operationType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to paste materials: ${response.status} ${response.statusText}`);
  }

  return true;
};

export const uploadTrainingFile = async (
  signedUrl: string,
  path: string,
  currentFile: File | undefined,
  fileName: string,
) => {
  try {
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: currentFile,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload to storage failed');
    }

    const saveResponse = await fetch(`${BASE_API_URL}/training/save-training-material`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ name: fileName, path }),
    });

    if (!saveResponse.ok) {
      throw new Error('Saving to training materials failed');
    }

    const result = await saveResponse.json();
    return result?.message || 'Uploaded successfully';
  } catch (error) {
    console.error('Error in uploadTrainingFile:', error);
    throw error;
  }
};

export const downloadFileFromSignedUrl = async (file: FileType) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/training/training-materials/view?path=${file.path}`,
      {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`,
        },
      },
    );

    if (!response.ok) throw new Error(`Failed to fetch signed URL for file: ${file.name}`);

    const data = await response.json();
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.setAttribute('download', file.name);
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading file ${file.name}:`, error);
  }
};

export const downloadZippedFolder = async (file: FileType) => {
  try {
    const response = await fetch(
      `${BASE_API_URL}/training/training-materials/download-folder?path=${file.path}`,
      {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`,
        },
      },
    );

    if (!response.ok) throw new Error(`Failed to download folder: ${file.name}`);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name}.zip`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading folder ${file.name}:`, error);
  }
};

export const fetchFileContent = async (encodedPath: string, direct: boolean = false) => {
  const url = `${BASE_API_URL}/training/training-materials/view?path=${encodedPath}${direct ? '&direct=true' : ''}`;

  return await fetch(url, {
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
};
