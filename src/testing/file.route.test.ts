import request from 'supertest'
import express from 'express'
import { describe, it } from 'node:test'
import { expect } from 'chai'
import { Readable } from 'stream'

export function FileRouteTest(app: ReturnType<typeof express>) {
    describe("File route - Success cases", () => {
        it("POST /file/upload - Upload file with valid headers and stream", async () => {
            fetch("https://localhost:3000/bucket/create", {
                method: "POST",
                body: JSON.stringify({bucketName: 'archbucket'})
            }).then(async () => {
                console.log("File upload test")
                const testFileContent = Buffer.from('test file content')
                const fileName = 'test-file.txt'
                const bucketName = 'archbucket'
                const contentType = 'text/plain'

                const res = await request(app)
                    .post("/file/upload")
                    .set('x-file-name', fileName)
                    .set('x-bucket-name', bucketName)
                    .set('content-type', contentType)
                    .send(testFileContent)


                expect(res.status).to.equal(200)
                expect(res.body).to.have.property("message")
                expect(res.body.message).to.equal("File uploaded successfully")
                expect(res.body).to.have.property("data")
                expect(res.body.data).to.have.property("url")
            })
        })
        it("GET /file/download - Download file with valid parameters", async () => {
                const bucketName = 'archbucket'
                const fileName = 'test-file.txt'

                const res = await request(app)
                    .get("/file/download")
                    .query({ bucketName, fileName })

                console.log(res.error)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property("message")
                expect(res.body.message).to.equal("File downloaded")
                expect(res.body).to.have.property("data")
                expect(res.body.data).to.have.property("url")
                expect(res.body.data.url).to.be.a("string")
        })

        it("DELETE /file/delete - Delete file with valid parameters", async () => {
            const bucketName = 'archbucket'
            const fileName = 'test-file.txt'

            const res = await request(app)
                .delete("/file/delete")
                .query({ bucketName, fileName })
            
            // console.log(res.error)

            expect(res.status).to.equal(200)
            expect(res.body).to.have.property("message")
            expect(res.body.message).to.equal("File deleted")
        })
    })
}

export function FileErrorTest(app: ReturnType<typeof express>) {
    describe("File route - Error cases", () => {
        it("POST /file/upload - Reject upload without x-file-name header", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app)
                .post("/file/upload")
                .set('x-bucket-name', 'test-bucket')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("POST /file/upload - Reject upload without x-bucket-name header", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app)
                .post("/file/upload")
                .set('x-file-name', 'test-file.txt')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("POST /file/upload - Reject upload with empty x-file-name", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app)
                .post("/file/upload")
                .set('x-file-name', '')
                .set('x-bucket-name', 'test-bucket')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("POST /file/upload - Reject upload with empty x-bucket-name", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app)
                .post("/file/upload")
                .set('x-file-name', 'test-file.txt')
                .set('x-bucket-name', '')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("GET /file/download - Reject download without bucketName parameter", async () => {
            const res = await request(app)
                .get("/file/download")
                .query({ fileName: 'test-file.txt' })

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("GET /file/download - Reject download without fileName parameter", async () => {
            const res = await request(app)
                .get("/file/download")
                .query({ bucketName: 'test-bucket' })

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("GET /file/download - Reject download with missing query parameters", async () => {
            const res = await request(app)
                .get("/file/download")

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE /file/delete - Reject delete without fileName parameter", async () => {
            const res = await request(app)
                .delete("/file/delete")
                .query({ bucketName: 'test-bucket' })

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE /file/delete - Reject delete without bucketName parameter", async () => {
            const res = await request(app)
                .delete("/file/delete")
                .query({ fileName: 'test-file.txt' })

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE /file/delete - Reject delete with missing query parameters", async () => {
            const res = await request(app)
                .delete("/file/delete")

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })
    })
}
