import request from 'supertest'
import express from 'express'
import { describe, it } from 'node:test'
import { expect } from 'chai'


export function BucketRouteTest(app: ReturnType<typeof express>) {
    describe("Bucket route success testing", () => {
        it("POST: Create a bucket", async () => {
            const res = await request(app)
                .post("/bucket/create")
                .send({bucketName: "archbucket"})

            expect(res.status).to.equal(200)
            // expect(res.body.message).to.have("Bucket created successfully")
        })

        it("DELETE: Delete bucket", async () => {
            const res = await request(app)
                .delete("/bucket/delete")
                .query({bucketName: "archbucket"})
            
            expect(res.status).to.equal(200)
            expect(res.body.message).to.have("Bucket archbucket deleted successfully")
        })
        
        it("DELETE: Clear bucket file", async () => {
            const res = await request(app)
                .delete("/bucket/clear")
                .query({bucketName: "archbucket"})
            expect(res.status).to.equal(200)
            expect(res.body.message).to.have("Bucket archbucket cleared successfully")
        })

        it("GET: Get all existed bucket", async () => {
            const res = await request(app)
                .get("/bucket/list")
            expect(res.status).to.equal(200)
            expect(res.body.data).to.be.an("array")
        })

        it("GET: Get all files inside bucket", async () => {
            const res = await request(app)
                .get("/bucket/peek")
                .query({bucketName: 'archbucket'})
                
            expect(res.status).to.equal(200)
            expect(res.body.data).to.be.an("array")
        })
    })
}

export function BucketErrorTest(app: ReturnType<typeof express>) {
    describe("Bucket route error test", () => {
        it("POST: Create bucket with invalid data", async () => {
            const res = await request(app)
                .post("/bucket/create")
                .send({bucke: 'archbucket'})
            
            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("POST: Create bucket that already exist", async () => {
            const res = await request(app)
                .post("/bucket/create")
                .send({bucketName: 'archbucket'})
                
            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE: Delete bucket with invalid data", async () => {
            const res = await request(app)
                .post("/bucket/delete")
                .query({bucketName: 'archbucket'})

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE: Delete not exist bucket", async () => {
            const res = await request(app)
                .post("/bucket/delete")
                .query({bucketName: 'archbucket'})
            
            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("message")
        })

        it("DELETE: Clear not existed bucket", async () => {
            const res = await request(app)
                .post("/bucket/clear")
                .query({bucketName: 'archbucket'})

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("messsage")
        })

        it("GET: Get files inside not existed bucket", async () => {
            const res = await request(app)
                .get("/bucket/peek")
                .query({bucketName: 'archbucket'})

            expect(res.status).to.not.equal(200)
            expect(res.body).to.have.property("messsage")
        })
    })
}