import express from 'express'
import { TryCatchController } from '../utilities/trycatch.wrapper.js'
import { superStructValidation } from '../utilities/superstruct.validation.js'
import { array, object, string } from 'superstruct'
import { SuccessResponse } from '../utilities/sendSucessResponse.js'
import { SnippetRouteServices } from '../services/snippet_services.js'
import { ErrorTypeCall } from '../error_modules/error.class.js'

export const snippet = express.Router()
const snippetService = new SnippetRouteServices()

snippet.get('/lists', TryCatchController(async ({ res }) => {
  const { snippets } = await snippetService.getSnippetsList()
  SuccessResponse(res, {
    message: 'Get snippet lists success',
    data: {
      snippets
    }
  })
}, { isAsync: true }))

snippet.post('/create', TryCatchController(async ({ req, res }) => {
  const snippetDataArray = superStructValidation(array(
    object({
      alias: string(),
      description: string(),
      content: string()
    })
  ), req.body)

  if (snippetDataArray.length == 0) {
    ErrorTypeCall.badRequest("Insert snippet data")
  }

  await snippetService.createSnippets(snippetDataArray)

  SuccessResponse(res, {
    message: 'Snippet saved'
  })
}, { isAsync: true }))
