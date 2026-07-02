import express from "express";
import { ErrorMiddleware } from "./middleware/error.middleware.js";
import { DataSource } from "typeorm";
import { Client } from "minio";
import { file } from "./route/file.js";
import { bucket } from "./route/bucket.js";
import { Buckets, Files, Snippets } from "./entity.js";
import { snippet } from "./route/snippet.js";


// Storage / Database
export const main_db = new DataSource({
  type: "better-sqlite3",
  database: "./app.db",
  synchronize: true,
  entities: [Snippets, Buckets, Files],
});
await main_db.initialize();
export const MinIOClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin123',
  region: 'us-east-1'
})
// 1. Set policy yang benar untuk bucket
const policy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicRead",
      Effect: "Allow",
      Principal: {
        AWS: ["*"]
      },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::*/*`]
    }
  ]
};

await MinIOClient.setBucketPolicy('archbucket', JSON.stringify(policy));

// Application / Routes
const app = express();

// Middleware
app.use(express.json());

// Register file routes
app.use('/file', file);
app.use('/bucket', bucket);
app.use('/snippet', snippet)


app.use(ErrorMiddleware());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
