import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest';
import { CustomGlobalException } from "src/GlobalException";
import { AppModule } from "src/app.module";

describe("File route testing", () => {
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
        it("POST /file/upload - Upload file with valid headers and stream", async () => {
            // Create bucket first
            await request(app.getHttpServer())
                .post("/bucket/create")
                .send({bucketName: 'archbucket'})
                .set('Content-Type', 'application/json')

            const testFileContent = Buffer.from('test file content')
            const fileName = 'test-file.txt'
            const bucketName = 'archbucket'
            const contentType = 'text/plain'

            const res = await request(app.getHttpServer())
                .post("/file/upload")
                .set('x-file-name', fileName)
                .set('x-bucket-name', bucketName)
                .set('content-type', contentType)
                .send(testFileContent)
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty("message")
            expect(res.body.message).toBe("File uploaded successfully")
            expect(res.body).toHaveProperty("data")
            expect(res.body.data).toHaveProperty("url")
        })

        it("GET /file/download - Download file with valid parameters", async () => {
            const bucketName = 'archbucket'
            const fileName = 'test-file.txt'

            const res = await request(app.getHttpServer())
                .get("/file/download")
                .query({ bucketName, fileName })
            
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty("message")
            expect(res.body.message).toBe("File downloaded")
            expect(res.body).toHaveProperty("data")
            expect(res.body.data).toHaveProperty("url")
            expect(typeof res.body.data.url).toBe("string")
        })

        it("DELETE /file/delete - Delete file with valid parameters", async () => {
            const bucketName = 'archbucket'
            const fileName = 'test-file.txt'

            const res = await request(app.getHttpServer())
                .delete("/file/delete")
                .query({ bucketName, fileName })

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty("message")
            expect(res.body.message).toBe("File deleted")
        })
    })

    describe("Error cases", () => {
        it("POST /file/upload - Reject upload without x-file-name header", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app.getHttpServer())
                .post("/file/upload")
                .set('x-bucket-name', 'test-bucket')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("POST /file/upload - Reject upload without x-bucket-name header", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app.getHttpServer())
                .post("/file/upload")
                .set('x-file-name', 'test-file.txt')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("POST /file/upload - Reject upload with empty x-file-name", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app.getHttpServer())
                .post("/file/upload")
                .set('x-file-name', '')
                .set('x-bucket-name', 'test-bucket')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("POST /file/upload - Reject upload with empty x-bucket-name", async () => {
            const testFileContent = Buffer.from('test file content')

            const res = await request(app.getHttpServer())
                .post("/file/upload")
                .set('x-file-name', 'test-file.txt')
                .set('x-bucket-name', '')
                .set('content-type', 'text/plain')
                .send(testFileContent)

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("GET /file/download - Reject download without bucketName parameter", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/download")
                .query({ fileName: 'test-file.txt' })

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("GET /file/download - Reject download without fileName parameter", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/download")
                .query({ bucketName: 'test-bucket' })

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("GET /file/download - Reject download with missing query parameters", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/download")

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /file/delete - Reject delete without fileName parameter", async () => {
            const res = await request(app.getHttpServer())
                .delete("/file/delete")
                .query({ bucketName: 'test-bucket' })

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /file/delete - Reject delete without bucketName parameter", async () => {
            const res = await request(app.getHttpServer())
                .delete("/file/delete")
                .query({ fileName: 'test-file.txt' })

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })

        it("DELETE /file/delete - Reject delete with missing query parameters", async () => {
            const res = await request(app.getHttpServer())
                .delete("/file/delete")

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })
    })

})
