import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import formidable, { File as FormidableFile } from 'formidable';
import sharp from 'sharp';
import type { UploadResponse } from '@/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const form = formidable({ multiples: false });
    form.parse(req, async (err: Error | null, fields, files) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const file: FormidableFile | undefined = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const filename = `${randomUUID()}.jpg`;
      const filepath = path.join(uploadsDir, filename);
      try {
        // Optimize and save image using sharp
        await sharp(file.filepath)
          .resize({ width: 1280, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(filepath);
        const url = `/uploads/${filename}`;
        res.status(200).json({ url, size: file.size, mimetype: file.mimetype });
      } catch (err: any) {
        res.status(500).json({ error: (err as Error).message || 'Image optimization failed' });
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: (err as Error).message || 'Upload failed' });
  }
} 