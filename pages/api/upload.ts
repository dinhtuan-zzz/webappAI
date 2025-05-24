import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import formidable from 'formidable';
import type { File as FormidableFile } from 'formidable';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const fileInput = files.file;
      const file: FormidableFile | undefined = Array.isArray(fileInput) ? fileInput[0] : fileInput;
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
        res.status(200).json({ url });
      } catch (err: any) {
        res.status(500).json({ error: err.message || 'Image optimization failed' });
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
} 