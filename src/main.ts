import 'dotenv/config'
import express from "express";
import { ErrorMiddleware } from "./middleware/error.middleware.js";
import { DataSource } from "typeorm";
import { Client } from "minio";
import fs from 'fs'
import { file } from "./route/file.js";
import { bucket } from "./route/bucket.js";
import { Buckets, Files, Snippets } from "./entity.js";
import { snippet } from "./route/snippet.js";
import { EnvVariable } from './utilities/envStatus.js';
import path from 'path';
import os from 'os'
import https from 'https'
import { SnippetErrorTest, SnippetRouteTest } from './testing/snippet.route.test.js';
import { FileErrorTest, FileRouteTest } from './testing/file.route.test.js';

// Storage / Database
export const main_db = new DataSource({
  type: "better-sqlite3",
  database: "./app.db",
  synchronize: EnvVariable('NODE_ENV') === 'development',
  entities: [Snippets, Buckets, Files],
});
await main_db.initialize();
console.log(process.env.MINIO_ACCESS_KEY, process.env.MINIO_SECRET_KEY)
export const MinIOClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
  region: 'us-east-1'
})

// Application / Routes
const app = express();

const option = {
  key: fs.readFileSync(path.join(os.homedir(), 'localCert', 'localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(os.homedir(), 'localCert', 'localhost+2.pem')),
}

// Middleware
app.use(express.json());

// Register file routes
app.use('/file', file);
app.use('/bucket', bucket);
app.use('/snippet', snippet)

// Snippet test
SnippetRouteTest(app)
SnippetErrorTest(app)

// File test
FileRouteTest(app)
FileErrorTest(app)


app.use(ErrorMiddleware());

https.createServer(option, app).listen(3000, () => {
  console.log("Server listening now")
})
