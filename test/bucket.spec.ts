import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest';
import { CustomGlobalException } from "src/GlobalException";
import { AppModule } from "src/app.module";

describe("Bucket route testing", () => {
    let app: INestApplication;
    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        }))
        app.useGlobalFilters(new CustomGlobalException())

        await app.init()
    })
    afterAll(async() => {
        await app.close()
    })

    describe("Success cases", () => {
        it("POST /bucket/create - Create a bucket", async () => {
            // First delete the bucket if it exists
            await request(app.getHttpServer())
                .delete("/bucket/delete")
                .query({bucketName: "testbucket123"})

            const res = await request(app.getHttpServer())
                .post("/bucket/create")
                .send({bucketName: "testbucket123"})

            expect(res.status).toBe(201)
        })

        it("DELETE /bucket/delete - Delete bucket", async () => {
            const res = await request(app.getHttpServer())
                .delete("/bucket/delete")
                .query({bucketName: "testbucket123"})
            
            expect(res.status).toBe(200)
            expect(res.body.message).toContain("Bucket testbucket123 deleted successfully")
        })
        
        it("DELETE /bucket/clear - Clear bucket files", async () => {
            const res = await request(app.getHttpServer())
                .delete("/bucket/clear")
                .query({bucketName: "archbucket"})
            
            expect(res.status).toBe(200)
            expect(res.body.message).toContain("Bucket archbucket cleared successfully")
        })

        it("GET /bucket/list - Get all existed buckets", async () => {
            const res = await request(app.getHttpServer())
                .get("/bucket/list")
            
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
        })

        it("GET /bucket/peek - Get all files inside bucket", async () => {
            const res = await request(app.getHttpServer())
                .get("/bucket/peek")
                .query({bucketName: 'archbucket'})
                
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
        })
    })

    describe("Error cases", () => {
        it("POST /bucket/create - Create bucket with invalid data", async () => {
            const res = await request(app.getHttpServer())
                .post("/bucket/create")
                .send({bucke: 'archbucket'})
            
            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("POST /bucket/create - Create bucket that already exists", async () => {
            const res = await request(app.getHttpServer())
                .post("/bucket/create")
                .send({bucketName: 'archbucket'})

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /bucket/delete - Delete bucket with invalid data", async () => {
            const res = await request(app.getHttpServer())
                .delete("/bucket/delete")
                .query({bucketName: 'archbucket'})

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /bucket/delete - Delete non-existent bucket", async () => {
            const res = await request(app.getHttpServer())
                .delete("/bucket/delete")
                .query({bucketName: 'nonexistentbucket'})
            
            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /bucket/clear - Clear non-existent bucket", async () => {
            const res = await request(app.getHttpServer())
                .delete("/bucket/clear")
                .query({bucketName: 'nonexistentbucket'})

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("GET /bucket/peek - Get files inside non-existent bucket", async () => {
            const res = await request(app.getHttpServer())
                .get("/bucket/peek")
                .query({bucketName: 'nonexistentbucket'})

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })
    })

})
