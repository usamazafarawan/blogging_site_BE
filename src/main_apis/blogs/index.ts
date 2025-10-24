import express from 'express';
const router = express.Router();
import * as controller from './blogs.controller';
import path from 'path';
import multer from 'multer';





// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Save to uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });
// router.post(
//   '/create',
//   upload.fields([
//     { name: 'pdfFile', maxCount: 1 },
//     { name: 'thumbnail', maxCount: 1 },
//   ]),
//   controller.createBlog
// );

  router.get('/get', controller.getBlogs);
  router.get('/pdf/:id', controller.getPdfByBlogId);
  router.get('/img/:id', controller.getImageByBlogId);
  router.get('/category/:id', controller.getBlogsByCategory);
  router.get('/blog/:id', controller.getBlogById);
  router.post('/create', controller.createBlog);
  router.put('/update/:id', controller.updateBlogById);
  router.delete('/delete/:id', controller.deleteBlogById);



export = router

