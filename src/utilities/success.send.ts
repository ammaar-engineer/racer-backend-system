import type {Response} from 'express'
import type { consistent_output } from '../types.js'

export function SuccessResponse(res: Response, data: consistent_output) {
  const response: consistent_output = {
    message: 'Success',
    statusCode: 200,
    errorCode: '',
    success: true,
    ...data as any
  }
  res.status(response.statusCode as number).json(response)
}