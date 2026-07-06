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
            expect(res.body.message).to.have("Bucket created successfully")
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