import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import { FileManager } from '@webdevfarhan/react-file-manager';
import type {
  FileManagerFile,
  FileManagerFolder,
  FileManagerOperation,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
} from '@webdevfarhan/react-file-manager';
import '@webdevfarhan/react-file-manager/dist/style.css';
import { getTokenFromLocalStorage } from '../../helpers/index.js';
import {
  fetchTrainingMaterials,
  createTrainingFolder,
  renameTrainingMaterial,
  deleteTrainingMaterials,
  pasteTrainingMaterials,
  uploadTrainingFile,
  downloadZippedFolder,
  downloadFileFromSignedUrl,
  fetchFileContent,
} from '../../helpers/training-materials/index.js';
import { toast } from 'react-toastify';

import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.js';
import {
  FileType,
  UploadResponseType,
  PreviewComponentProps,
} from '../../types/TrainingMaterials.types.ts';
import { checkUserAccess } from '../../helpers/index.ts';
import PageHeader from './custom/PageHeader.tsx';

const TrainingMaterials = () => {
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasElevatedAccess, setHasElevatedAccess] = useState<boolean>(false);
  const [layout] = useState<'grid' | 'list'>(window.innerWidth < 630 ? 'grid' : 'list');
  const uploadQueue = useRef<File[]>([]);

  useEffect(() => {
    fetchMaterials();
    const res = checkUserAccess();
    setHasElevatedAccess(res?.hasElevatedAccess ?? false);

    if (!hasElevatedAccess) {
      // Create mutation observer to watch for DOM changes
      const observer = new MutationObserver(() => {
        const uploadButton = document
          .querySelector('button.item-action svg[viewBox="0 0 24 24"]')
          ?.closest('button');
        if (uploadButton) {
          (uploadButton as HTMLButtonElement).style.display = 'none';
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [hasElevatedAccess]);

  const handleUnauthorizedAction = () => {
    toast.error("You don't have permission to modify training materials", TOAST_CONFIG.ERROR);
    fetchMaterials();
  };

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const transformedData = await fetchTrainingMaterials();
      setFiles(transformedData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load training materials', TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folderName: string, parentFolder: FileType | null) => {
    const parentPath = parentFolder?.path || '/';

    try {
      setIsLoading(true);
      const newFolder = await createTrainingFolder(folderName, parentPath);
      setFiles((prevFiles) => [...prevFiles, newFolder]);
      toast.success('Folder created successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder', TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (file: FileType, newName: string) => {
    try {
      setIsLoading(true);
      await renameTrainingMaterial({
        fileId: file.key,
        newName,
        isDirectory: file.isDirectory,
        path: file.path,
      });
      await fetchMaterials();
      toast.success('Item renamed successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error renaming file/folder:', error);
      toast.error('Failed to rename item', TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMaterials();
  };

  const handleDelete = async (files: FileType[]) => {
    try {
      setIsLoading(true);
      await deleteTrainingMaterials(files);
      await fetchMaterials();
      toast.success('Items deleted successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error deleting files/folders:', error);
      toast.error('Failed to delete items', TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async (
    files: FileType[],
    destinationFolder: FileType | null,
    operationType: string,
  ) => {
    const destinationPath = destinationFolder?.path || '/';

    try {
      setIsLoading(true);
      await pasteTrainingMaterials(files, destinationPath, operationType);
      await fetchMaterials();
      toast.success(`Items ${operationType.toLowerCase()}d successfully`, TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error pasting files/folders:', error);
      toast.error(`Failed to ${operationType.toLowerCase()} items`, TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (files: FileType[]) => {
    for (const file of files) {
      if (file.isDirectory) {
        await downloadZippedFolder(file);
      } else {
        await downloadFileFromSignedUrl(file);
      }
    }
  };

  const PreviewComponent = ({ file }: PreviewComponentProps) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      const getFileUrl = async () => {
        try {
          setLoading(true);
          const encodedPath = encodeURIComponent(file.path);
          const fileExtension = file.name.split('.').pop()?.toLowerCase();

          if (fileExtension === 'pdf') {
            const response = await fetchFileContent(encodedPath, true);
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            setPdfBlob(blob);
            const blobUrl = URL.createObjectURL(blob);
            setFileUrl(blobUrl);
          } else {
            const response = await fetchFileContent(encodedPath, false);
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setFileUrl(data.signedUrl);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
            console.error('Error fetching file:', err);
          }
        } finally {
          setLoading(false);
        }
      };

      if (!file.is_directory) {
        getFileUrl();
      }

      return () => {
        if (fileUrl && file.name.toLowerCase().endsWith('.pdf')) {
          URL.revokeObjectURL(fileUrl);
        }
      };
    }, [file]);

    if (loading) return <div>Loading preview...</div>;
    if (error) return <div>Error loading preview: {error}</div>;
    if (!fileUrl) return <div>Unable to generate preview</div>;

    const fileExtension: string | undefined = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={fileUrl} alt={file.name} style={{ maxWidth: '100%' }} />;
    }

    if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls style={{ maxWidth: '100%' }}>
          <source src={fileUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (fileExtension === 'pdf') {
      if (isMobile) {
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>PDF preview may not work reliably on mobile devices.</p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => window.open(fileUrl, '_blank')}
                style={{
                  padding: '10px 15px',
                  background: '#24A5DF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '200px',
                }}
              >
                Open PDF
              </button>

              {pdfBlob && (
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{
                    padding: '10px 15px',
                    background: '#24A5DF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '200px',
                  }}
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <>
            <iframe
              src={fileUrl}
              width="100%"
              height={layout === 'list' ? '600px' : '400px'}
              title={file.name}
              style={{ border: 'none' }}
            />
            <div style={{ textAlign: 'center', margin: '5px 0' }}>
              <button
                onClick={() => window.open(fileUrl, '_blank')}
                style={{
                  padding: '5px 10px',
                  background: '#24A5DF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Open in New Tab
              </button>
            </div>
          </>
        );
      }
    }

    if (['doc', 'docx'].includes(fileExtension)) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>This document type requires external viewing.</p>
          <button onClick={() => window.open(fileUrl, '_blank')}>Open Document</button>
        </div>
      );
    }
  };

  const uploadFile = async (signedUrl: string, path: string, fileName: string) => {
    try {
      setIsLoading(true);
      const currentFile = uploadQueue.current.shift();

      if (!currentFile) {
        throw new Error('No file in upload queue');
      }

      const message = await uploadTrainingFile(signedUrl, path, currentFile, fileName);
      toast.success(message, TOAST_CONFIG.SUCCESS);
      return true;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('File upload failed', TOAST_CONFIG.ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-0 md:py-6 flex flex-col">
      <PageHeader title="Training Materials" showBackButton={true} />
      <FileManager
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          color: '#24A5DF',
        }}
        className="w-full max-w-[1600px] mx-auto bg-white p-5 h-full rounded-[30px] overflow-y-auto mb-8 shadow-sm"
        files={files}
        layout={layout}
        onCreateFolder={(folderName: string, parentFolder: FileManagerFolder) =>
          hasElevatedAccess
            ? handleCreateFolder(folderName, parentFolder)
            : handleUnauthorizedAction()
        }
        onRename={(file: FileManagerFile, newName: string) =>
          hasElevatedAccess ? handleRename(file, newName) : handleUnauthorizedAction()
        }
        onRefresh={handleRefresh}
        onDelete={(files: FileManagerFile[]) =>
          hasElevatedAccess ? handleDelete(files) : handleUnauthorizedAction()
        }
        onPaste={(
          files: FileManagerFile[],
          destination: FileManagerFolder,
          operation: FileManagerOperation,
        ) =>
          hasElevatedAccess
            ? handlePaste(files, destination, operation)
            : handleUnauthorizedAction()
        }
        fileUploadConfig={
          hasElevatedAccess
            ? {
                url: `${BASE_API_URL}/training/training-materials/upload`,
                headers: {
                  Authorization: `Bearer ${getTokenFromLocalStorage()}`,
                },
              }
            : {
                url: `${BASE_API_URL}/unauthorized`,
                beforeUpload: () => {
                  handleUnauthorizedAction();
                  return false;
                },
              }
        }
        onFileUploaded={async (response: string) => {
          if (!hasElevatedAccess) return;
          const parsedResponse: UploadResponseType = JSON.parse(response);
          await uploadFile(parsedResponse.signedUrl, parsedResponse.path, parsedResponse.fileName);
          await fetchMaterials();
        }}
        onFileUploading={(file: File, parentFolder: FileManagerFolder | null) => {
          if (!hasElevatedAccess) return null;
          uploadQueue.current.push(file);
          const fileName = file.name;
          if (!parentFolder || parentFolder.path === '/') {
            return { parentPath: `/${fileName}`, fileName, file: null };
          }
          const fullPath = `${parentFolder.path}/${fileName}`;
          return { parentPath: fullPath, fileName, file: null };
        }}
        googleBucketUpload={true}
        enableFilePreview={true}
        onDownload={handleDownload}
        isLoading={isLoading}
        filePreviewComponent={(file: FileType) => <PreviewComponent file={file} />}
        filePreviewPath={
          hasElevatedAccess
            ? `${BASE_API_URL}/training/training-materials/preview`
            : `${BASE_API_URL}/no-preview`
        }
        primaryColor={'#24A5DF'}
        secondaryColor={'#24A5DF'}
        fontFamily="'Gotham', sans-serif"
        height={'100%'}
      />
    </div>
  );
};

export default TrainingMaterials;
