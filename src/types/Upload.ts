import type { File as FormidableFile } from 'formidable';

export type _UploadModule = true; 

export interface UploadRequest {
  file: FormidableFile;
}

export interface UploadResponse {
  url: string;
  size: number;
  mimetype: string | null;
} 