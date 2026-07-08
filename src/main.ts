import 'dotenv/config'
import express from "express";
import { ErrorMiddleware } from "./middleware/error.middleware.js";
import { DataSource } from "typeorm";
import { Client } from "minio";
import { file } from "./route/file.js";
import { bucket } from "./route/bucket.js";
import { Buckets, Files, Snippets } from "./entity.js";
import { snippet } from "./route/snippet.js";
import { EnvVariable } from './utilities/envStatus.js';
import path from 'path';
import os from 'os'
import fs from 'fs'
import { SnippetErrorTest, SnippetRouteTest } from './testing/snippet.route.test.js';
import { FileErrorTest, FileRouteTest } from './testing/file.route.test.js';
import { BucketErrorTest, BucketRouteTest } from './testing/bucket.route.test.js';

// Storage / Database
export const main_db = new DataSource({
  type: "better-sqlite3",
  database: "./app.db",
  synchronize: EnvVariable('NODE_ENV') === 'development',
  entities: [Snippets, Buckets, Files],
});
await main_db.initialize();
export const MinIOClient = new Client({
  endPoint: process.env.HOST_MINIO as string,
  port: 80,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
  region: 'us-east-1'
})

// Opsi sertifikat kalo mau SSH
const option = {
  key: fs.readFileSync(path.join(os.homedir(), 'localCert', 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(os.homedir(), 'localCert', 'localhost+2.pem'))
}

// Application / Routes
const app = express();

// Middleware
app.use(express.json());

// Register file routes
app.use('/file', file);
app.use('/bucket', bucket);
app.use('/snippet', snippet)

// Snippet test
// SnippetRouteTest(app)
// SnippetErrorTest(app)

// File test
// FileRouteTest(app)
// FileErrorTest(app)

// Bucket test
// BucketRouteTest(app)
// BucketErrorTest(app)


app.use(ErrorMiddleware());

app.listen(3000, () => {
  console.log(`Now server running`)
})

// Untuk set ke https
// https.createServer(option, app).listen(3000, () => {
//   console.log("Server listening now")
// })
