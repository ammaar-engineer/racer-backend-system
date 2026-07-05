import express from 'express'
import { TryCatchController } from '../utilities/trycatch.wrapper.js'
import { superStructValidation } from '../utilities/superstruct.validation.js'
import { object, size, string } from 'superstruct'
import { SuccessResponse } from '../utilities/sendSucessResponse.js'
import { BucketRouteServices } from '../services/bucket_services.js'

export const bucket = express.Router()
const bucketService = new BucketRouteServices()

bucket.post('/create', TryCatchController(async ({req, res, next}) => {
    const {bucketName} = superStructValidation(object({
        bucketName: size(string(), 3, 15)
    }), req.body)
    
    const data = await bucketService.createBucket(bucketName)
    
    SuccessResponse(res, {
        message: 'Bucket created successfully',
    })
}, {isAsync: true}))

bucket.delete('/delete', TryCatchController(async ({req, res, next}) => {
    const {bucketName} = superStructValidation(object({
        bucketName: string()
    }), req.query)
    console.log(req.query)
    
    await bucketService.deleteBucket(bucketName)
    
    SuccessResponse(res, {
        message: `Bucket ${bucketName} deleted successfully`,
    })
}, {isAsync: true}))

bucket.delete('/clear', TryCatchController(async ({res, req}) => {
    const {bucketName} = superStructValidation(object({
        bucketName: string()
    }), req.query)
    
    await bucketService.clearBucket(bucketName)
    
    SuccessResponse(res, {
        message: `Bucket ${bucketName} cleared successfully`
    })
}, {isAsync: true}))

bucket.get("/list", TryCatchController(async({res}) => {
    const bucket = await bucketService.bucketList()
    SuccessResponse(res, {
        message: 'Success',
        data: bucket
    })
}, {isAsync: true}))

bucket.get('/peek', TryCatchController(async ({req, res, next}) => {
    const {bucketName} = superStructValidation(object({
        bucketName: string()
    }), req.query)

    const data = await bucketService.peekBucket(bucketName)

    SuccessResponse(res, {
        message: 'Files retrieved successfully',
        data: data.files
    })
}, {isAsync: true}))