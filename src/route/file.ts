import express from "express";
import { TryCatchController } from "../utilities/trycatch.wrapper.js";
import { SuccessResponse } from "../utilities/sendSucessResponse.js";
import { superStructValidation } from "../utilities/superstruct.validation.js";
import { object, string, size, type } from "superstruct";
import { FileRouteServices } from "../services/file_services.js";


export const file = express.Router();
const fileService = new FileRouteServices();

file.post('/upload', TryCatchController(async ({ req, res, next }) => {
  const headers = superStructValidation(
    type({
      'x-file-name': size(string(), 1, Infinity),
      'x-bucket-name': size(string(), 1, Infinity),
      'content-type': string(),
      'content-length': string()
    }), 
    req.headers
  );

  const fileName = headers['x-file-name']
  const bucketName = headers['x-bucket-name']
  const ContentType = headers['content-type']
  const fileSize = parseInt(headers['content-length'], 10)
  
  const {url} = await fileService.uploadFile(
    req,
    fileName,
    bucketName,
    ContentType,
    fileSize
  )
    
  SuccessResponse(res, {
    message: 'File uploaded successfully',
    data: {
      url
    }
  })
}, {isAsync: true}))

file.get('/download', TryCatchController(async({req, res, next}) => {
  const {bucketName, fileName} = superStructValidation(object({
    bucketName: string(),
    fileName: string()
  }), req.query)

  const {url: rawUrl} = await fileService.downloadFile(bucketName, fileName)
  const url = rawUrl.replace(
    'localhost:9000',
    'link ip VPS'
  )

  SuccessResponse(res, {
    message: 'File downloaded',
    data: {
      url: rawUrl
    }
  })

}, {isAsync: true}))

file.delete('/delete', TryCatchController(async({req, res, next}) => {
  const {fileName, bucketName} = superStructValidation(object({
    fileName: string(),
    bucketName: string()
  }), req.query)

  await fileService.deleteFile(fileName, bucketName)

  SuccessResponse(res, {
    message: 'File deleted'
  })

}, {isAsync: true}))
