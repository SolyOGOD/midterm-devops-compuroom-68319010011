const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

// Mock db.js pool query
jest.mock('../src/db', () => ({
    query: jest.fn()
}));

describe('Computer API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: GET /health
    test('GET /health should return 200 and ok status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('version', '1.0.0');
    });

    // Test 2: GET /api/computers
    test('GET /api/computers should return list of computers', async () => {
        const mockComputers = [
            { id: 1, asset_code: 'COM-01', brand_model: 'Acer', cpu: 'i5', ram_gb: 16, room: '501', status: 'ใช้งาน' }
        ];
        pool.query.mockResolvedValueOnce({ rows: mockComputers });

        const res = await request(app).get('/api/computers');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty('asset_code', 'COM-01');
    });

    // Test 3: POST /api/computers fail validation
    test('POST /api/computers should return 400 when body is incomplete', async () => {
        const incompleteData = { asset_code: 'COM-02' }; // missing other fields

        const res = await request(app)
            .post('/api/computers')
            .send(incompleteData);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'กรุณากรอกข้อมูลให้ครบถ้วนทุกฟิลด์');
    });

    // Test 4: POST /api/computers success (mocked db insert)
    test('POST /api/computers should return 201 on success', async () => {
        const validData = {
            asset_code: 'COM-02',
            brand_model: 'HP',
            cpu: 'i7',
            ram_gb: 8,
            room: '501',
            status: 'ใช้งาน'
        };

        // Mock check unique
        pool.query.mockResolvedValueOnce({ rows: [] }); // no existing
        // Mock insert
        pool.query.mockResolvedValueOnce({ rows: [{ id: 2, ...validData }] });

        const res = await request(app)
            .post('/api/computers')
            .send(validData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id', 2);
        expect(res.body).toHaveProperty('asset_code', 'COM-02');
    });
});
