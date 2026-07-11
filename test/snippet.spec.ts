import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest';
import { CustomGlobalException } from "src/GlobalException";
import { AppModule } from "src/app.module";

describe("Snippets route testing", () => {
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
        it("GET /snippets/list - Return snippet list", async () => {
            const res = await request(app.getHttpServer()).get("/snippets/list")
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty("data")
            expect(res.body.data).toHaveProperty("snippets")
            expect(Array.isArray(res.body.data.snippets)).toBe(true)
        })

        it("POST /snippets/create - Create snippets with valid data", async () => {
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

            const res = await request(app.getHttpServer())
                .post("/snippets/create")
                .send(testSnippets)
                .set('Content-Type', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty("message")
            expect(res.body.message).toBe("Snippet created")
        })

        it("GET /snippets/list - Verify created snippets are returned", async () => {
            // First create some snippets
            const testSnippets = [
                {
                    alias: "verify-snippet",
                    description: "Verification snippet",
                    content: "console.log('verify')"
                }
            ]

            await request(app.getHttpServer())
                .post("/snippets/create")
                .send(testSnippets)
                .set('Content-Type', 'application/json')

            // Then verify they're returned
            const res = await request(app.getHttpServer()).get("/snippets/list")
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data.snippets)).toBe(true)
            expect(res.body.data.snippets.length).toBeGreaterThan(0)
            
            // Verify snippet structure
            const snippet = res.body.data.snippets[0]
            expect(snippet).toHaveProperty("alias")
            expect(snippet).toHaveProperty("description")
            expect(snippet).toHaveProperty("content")
        })
    })

    describe("Error cases", () => {
        it("POST /snippets/create - Reject invalid data structure", async () => {
            const invalidData = [
                {
                    alias: "test-snippet",
                    description: "Missing content field"
                    // content field is missing
                }
            ]

            const res = await request(app.getHttpServer())
                .post("/snippets/create")
                .send(invalidData)
                .set('Content-Type', 'application/json')

            expect(res.status).not.toBe(200)
        })

        it("POST /snippets/create - Reject non-array data", async () => {
            const invalidData = {
                alias: "test-snippet",
                description: "Not an array",
                content: "console.log('test')"
            }
            
            const res = await request(app.getHttpServer())
                .post("/snippets/create")
                .send(invalidData)
                .set('Content-Type', 'application/json')

            expect(res.status).not.toBe(200)
        })

        it("POST /snippets/create - Handle empty array", async () => {
            const emptyArray: any[] = []

            const res = await request(app.getHttpServer())
                .post("/snippets/create")
                .send(emptyArray)
                .set('Content-Type', 'application/json')

            expect(res.status).not.toBe(200)
            expect(res.body).toHaveProperty("message")
        })
    })

})