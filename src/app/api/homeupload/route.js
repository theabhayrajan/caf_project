import { NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const uploadDir = `${process.env.NEXT_PUBLIC_PROD_URL}public/uploads`;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
    const filepath = path.join(process.cwd(), 'public/uploads', filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `${process.env.NEXT_PUBLIC_PROD_URL}/uploads/${filename}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}
