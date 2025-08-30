import multer from 'multer';

const storage = multer.memoryStorage()

export const SingleUpload = multer({storage}).single(`file`);