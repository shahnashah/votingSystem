import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const configureStorage = (uploadDir, filePrefix) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${filePrefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};