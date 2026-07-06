import request from 'supertest'
import express from 'express'
import { describe, it } from 'node:test'
import {expect} from 'chai'

export function SnippetRouteTest(app: ReturnType<typeof express>) {
    describe("Snippet route - Success cases", () => {
        it("GET /snippet/lists - Return snippet list", async () => {
            const res = await request(app).get("/snippet/lists")
            expect(res.status).to.equal(200)
            expect(res.body).to.have.property("data")
            expect(res.body.data).to.have.property("snippets")
            expect(res.body.data.snippets).to.be.an("array")
        })

        it("POST /snippet/create - Create snippets with valid data", async () => {
            const testSnippets = [
                {
                    alias: "test-snippet-1",
                    description: "Test snippet 1",
                    content: "console.log('test 1')"
                },
                {
                    alias: "test-snippet-2",
                    description: "Test snippet 2",
                    content: "console.log('test 2')"
                }
            ]

            const res = await request(app)
                .post("/snippet/create")
                .send(testSnippets)
                .set('Content-Type', 'application/json')

            expect(res.status).to.equal(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("Snippet saved")
        })

        it("GET /snippet/lists - Verify created snippets are returned", async () => {
            // First create some snippets
            const testSnippets = [
                {
                    alias: "verify-snippet",
                    description: "Verification snippet",
                    content: "console.log('verify')"
                }
            ]

            await request(app)
                .post("/snippet/create")
                .send(testSnippets)
                .set('Content-Type', 'application/json')

            // Then verify they're returned
            const res = await request(app).get("/snippet/lists")
            expect(res.status).to.equal(200)
            expect(res.body.data.snippets).to.be.an("array")
            expect(res.body.data.snippets).to.have.lengthOf.greaterThan(0)
            
            // Verify snippet structure
            const snippet = res.body.data.snippets[0]
            expect(snippet).to.have.property("alias")
            expect(snippet).to.have.property("description")
            expect(snippet).to.have.property("content")
        })
    })
}

export function SnippetErrorTest(app: ReturnType<typeof express>) {
    describe("Snippet route - Error cases", () => {
        it("POST /snippet/create - Reject invalid data structure", async () => {
            const invalidData = [
                {
                    alias: "test-snippet",
                    description: "Missing content field"
                    // content field is missing
                }
            ]

            const res = await request(app)
                .post("/snippet/create")
                .send(invalidData)
                .set('Content-Type', 'application/json')

            expect(res.status).to.not.equal(200)
        })

        it("POST /snippet/create - Reject non-array data", async () => {
            const invalidData = {
                alias: "test-snippet",
                description: "Not an array",
                content: "console.log('test')"
            }
            
            const res = await request(app)
                .post("/snippet/create")
                .send(invalidData)
                .set('Content-Type', 'application/json')

            expect(res.status).to.not.equal(200)
        })

        it("POST /snippet/create - Handle empty array", async () => {
            const emptyArray: any[] = []

            const res = await request(app)
                .post("/snippet/create")
                .send(emptyArray)
                .set('Content-Type', 'application/json')

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })
    })
}