
import express from "express";
import mongoose from "mongoose";
import http from "http";
import { routes } from "./route";
import { GridFSBucket } from "mongodb";
const path = require('path');
const fs = require("fs");
const multer = require("multer");
const bodyParser = require('body-parser');
const cors = require("cors");

export const app = express();
const server = http.createServer(app);

 app.use(express.json({limit: '200mb'}));
 app.use(express.urlencoded({limit: '200mb',     extended:true  },));
 app.use(bodyParser.json({limit: '200mb'}));
 app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));


// ✅ CORS — allow your frontend domains
app.use(cors({
  origin: [
    "https://blogging-site-fe.vercel.app",  // ✅ your frontend domain
    "http://localhost:4200",                // ✅ local Angular dev
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true,
}));




app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT, POST, PATCH, DELETE, OPTIONS");
    next();
});
const port = 3000;
export const TOKEN_KEY="11223344";

   /**
    * Vercel apis for live
    */
   app.use('/api/auth', require('./main_apis/signup'));
   app.use('/api/categories', require('./main_apis/categories'));
   app.use('/api/blogs', require('./main_apis/blogs'));




routes(app);

// const url =`mongodb://127.0.0.1:27017/testSchooldb`;
const url =`mongodb+srv://usama:usama@cluster0.y2fjq.mongodb.net/Blogging_Site?retryWrites=true&w=majority`;


mongoose.connect(url)
.then(() => {
   console.log('Connected to database!',url);
})
.catch(error => {
   console.log('Connection failed!:', error);
});

server.listen(port, () => {
console.log(`Express server listening ${port}`);
});



let gfsBucket;
mongoose.connection.once("open", () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "pdfs",
  });
  console.log("✅ GridFSBucket initialized");
});

export { gfsBucket };


 const environment = {
    // local backend URL
     apiUrl:  'http://localhost:3000'

      // Live backend URL
  // apiUrl:  'https://blogging-site-be.vercel.app'
};


export { environment };

export default app;
