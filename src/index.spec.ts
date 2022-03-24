import Request from '.';
import express from 'express';

global.host = 'http://localhost:3001';
global.fetch = require("node-fetch");
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

beforeAll(() => {
    const app = express().use(express.json())
    app.get('/api', (req, res) => { res.json(req.query) })
    app.post('/api', (req, res) => { res.sendStatus(201) })
    app.put('/api', (req, res) => { res.status(202).json(req.body) })
    app.delete('/api', (req, res) => { res.status(401).json({message: 'not authenticated'}) })
    app.listen(3001);
})

describe("Request Xhr", () => {
    Request.setMode('xhr');

    it("Should get with querystring and xhr receive 200 json body", async () => {
        const req = await Request<{name: string}>("/api", { id: 1, name: 'Jhon Doe' }).get()
        expect(req.data.name).toBe('Jhon Doe');
        expect(req.status).toBe(200);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })

    it("Should post with xhr and receive 201 with empty body plain text", async () => {
        const req = await Request("/api").post({ id: 1, name: 'Jhon Doe' })
        expect(req.data).toBe(undefined);
        expect(req.status).toBe(201);
        expect(req.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    })

    it("Should put with xhr and receive 202 with json reponse", async () => {
        const req = await Request("/api").put({ id: 1 })
        expect(req.status).toBe(202);
        expect(req.data).toBeInstanceOf(Object);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })

    it("Should delete with xhr and receive 401 unauthorized", async () => {
        try {
            await Request("/api").delete({ id: 1 });

        } catch (error) {
            if(error instanceof Request.Error){
                console.log(error)
                expect(error.data).toBeInstanceOf(Object);
                expect(error.status).toBe(401);
                expect(error.headers.get('content-type')).toBe('application/json; charset=utf-8');
            }
        }
    })
})

describe("Request using fetch", () => {
    Request.setMode('fetch');

    it("Should get with querystring and fetch receive 200 json body", async () => {
        const req = await Request<{name: string}>("/api", { id: 1, name: 'Jhon Doe' }).get()
        expect(req.data.name).toBe('Jhon Doe');
        expect(req.status).toBe(200);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })

    it("Should post with fetch and receive 201 with empty body plain text", async () => {
        const req = await Request("/api").post({ id: 1, name: 'Jhon Doe' })
        expect(req.data).toBe(undefined);
        expect(req.status).toBe(201);
        expect(req.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    })

    it("Should put with fetch and receive 202 with json reponse", async () => {
        const req = await Request("/api").put({ id: 1 })
        expect(req.status).toBe(202);
        expect(req.data).toBeInstanceOf(Object);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })

    it("Should delete with fetch and receive 401 unauthorized", async () => {
        try {
            await Request("/api").delete({ id: 1 });

        } catch (error) {
            if(error instanceof Request.Error){
                expect(error.data).toBeInstanceOf(Object);
                expect(error.status).toBe(401);
                expect(error.headers.get('content-type')).toBe('application/json; charset=utf-8');
            }
        }
    })
})