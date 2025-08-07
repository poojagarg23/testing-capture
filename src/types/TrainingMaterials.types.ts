export interface FileType {
  key: string;
  name: string;
  path: string;
  isDirectory: boolean;
  [key: string]: string | boolean;
}

export interface UploadResponseType {
  signedUrl: string;
  path: string;
  fileName: string;
}

export interface PreviewComponentProps {
  file: FileType;
}

export interface RenameTrainingMaterial {
  fileId: string;
  newName: string;
  isDirectory: boolean;
  path: string;
}
