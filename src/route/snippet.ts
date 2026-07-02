import express from 'express'
import { TryCatchController } from '../utilities/trycatch.wrapper.js'
import { superStructValidation } from '../utilities/superstruct.validation.js'
import { array, object, string } from 'superstruct'
import { SuccessResponse } from '../utilities/success.send.js'
import { SnippetRouteServices } from '../services/snippet.js'

export const snippet = express.Router()
const snippetService = new SnippetRouteServices()

snippet.get('/lists', TryCatchController(async({res, req, next}) => {
    const { snippets } = await snippetService.getSnippetsList()
    SuccessResponse(res, {
        message: 'Get snippet lists success',
        data: {
            snippets
        }
    })
}, {isAsync: true}))

snippet.post('/create', TryCatchController(async({req, res}) => {
    const snippetDataArray = superStructValidation(array(
        object({
            alias: string(),
            description: string(),
            content: string()
        })
    ), req.body)
    
    await snippetService.createSnippets(snippetDataArray)
    
    SuccessResponse(res, {
        message: 'Snippet saved'
    })
}, {isAsync: true}))

// snippet.put('/edit', TryCatchController(async({req, res}) => {
//     const {oldAlias} = superStructValidation(object({
//         oldAlias: string()
//     }), req.query)
//     const {alias, description, content} = superStructValidation(
//         object({
//             alias: optional(string()),
//             description: optional(string()),
//             content: optional(string())
//         }), 
//         req.body
//     )

//     if (!req.body) ErrorTypeCall.notFound('Atleast send one snippet data')

//     await snippetService.updateSnippet(oldAlias, {
//         description: description as string,
//         alias: alias as string,
//         content: content as string,
//     })

//     SuccessResponse(res, {
//         message: 'Snippet updated successfully'
//     })
// }, {isAsync: true}))

// snippet.delete('/delete', TryCatchController(async({req, res, next}) => {
//     const alias = req.query.alias as string
//     await snippetService.deleteSnippet(alias)
//     SuccessResponse(res, {
//         message: 'Snippet deleted successfully'
//     })

// }, {isAsync: true}))