const app = require('../../app');
const request = require('supertest');
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const UserPending = require('../../models/pending_user');
const User = require('../../models/user');


describe('Auth Routes', () => {
    let createTransportSpy;
    beforeEach(() => {
        createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
        createTransportSpy.mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({ done: "true" })
        })
    })

    afterEach(() => {
        createTransportSpy.mockRestore();
        jest.clearAllMocks();
    });

    describe('signup', () => {

        beforeAll(async () => {
            await UserPending.deleteMany();
            await User.deleteMany();
        })

        test('POST /auth/signup <=validation fail=> 422 && { message, data}', async () => {
            const response = await request(app).post('/auth/signup').send({
                enName: 'Emma Watson',
                arName: 'واتسون',
                password: '123456',
                userName: 'emma'
            });
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Validation Failed',
                data: expect.arrayContaining([expect.objectContaining({
                    location: expect.stringMatching(/body/),
                    path: expect.stringMatching(/password|enName|arName|userName|email/),
                    msg: expect.any(String),
                    type: expect.stringMatching(/field/)
                })])
            }));
        });

        test('POST /auth/signup <=success=> 201 && { message, userId }', async () => {
            const response = await request(app).post('/auth/signup').send({
                enName: 'Emma Watson',
                arName: 'واتسون',
                email: 'emadis4char@gmail.com',
                password: '123456',
                userName: 'emma'
            });
            const user = await UserPending.findOne({ email: 'emadis4char@gmail.com' }).exec();
            const _id = user._id.toString();
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User created, Still to be confirmed',
                userId: _id
            }));
        })

        test('POST /auth/signup <=user already exists=> 422 && { message }', async () => {
            await User.create({
                englishName: 'Emma Watson',
                arabicName: 'واتسون',
                email: 'emadis4char@gmail.com',
                password: '123456',
                userName: 'emma'
            });
            const response = await request(app).post('/auth/signup').send({
                enName: 'Emma Watson',
                arName: 'واتسون',
                email: 'emadis4char@gmail.com',
                password: '123456',
                userName: 'emma'
            });
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User already exists'
            }));
        });
    })
})