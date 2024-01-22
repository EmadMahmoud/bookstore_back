const app = require('../../app');
const request = require('supertest');
jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const UserPending = require('../../models/pending_user');
const User = require('../../models/user');

const fixedPart = '/api/v1';

describe('Auth Routes', () => {
    let createTransportSpy;
    beforeEach(() => {
        createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
        createTransportSpy.mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({ done: "true" })
        })
    });

    afterEach(() => {
        createTransportSpy.mockRestore();
        jest.clearAllMocks();
    });

    describe('Signup', () => {

        beforeAll(async () => {
            await UserPending.deleteMany();
            await User.deleteMany();
        })

        afterAll(async () => {
            await User.deleteMany();
        })

        test('POST /auth/signup <=validation fail=> 422 && { message, data}', async () => {
            const response = await request(app).post(`${fixedPart}/auth/signup`).send({
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
            const response = await request(app).post(`${fixedPart}/auth/signup`).send({
                enName: 'Emma Watson',
                arName: 'واتسون',
                email: 'emadis4char@gmail.com',
                password: '123456',
                userName: 'emma',
                role: 1
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
            const response = await request(app).post(`${fixedPart}/auth/signup`).send({
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
    });

    describe('Confirm Email', () => {
        test('POST /auth/confirm-email <=no user with that email or token=> 401 && { message }', async () => {
            const pendingUser = await UserPending.findOne({ email: 'emadis4char@gmail.com' });
            const response = await request(app).post(`${fixedPart}/auth/confirm-email`).query({
                e: 'wrongemail@gmail.com',
                t: pendingUser.token
            });
            expect(response.status).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Invalid Token'
            }))
        });

        test('POST /auth/confirm-email <=success=> 201 && { message, userId}', async () => {
            const pendingUser = await UserPending.findOne({ email: 'emadis4char@gmail.com' });
            const response = await request(app).post(`${fixedPart}/auth/confirm-email`).query({
                e: pendingUser.email,
                t: pendingUser.token
            });
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User Confirmed',
                userId: expect.any(String)
            }))
        });
    })

    describe('Login', () => {
        test('POST /auth/login <=validation fail=> 422 && { message, data}', async () => {
            const response = await request(app).post(`${fixedPart}/auth/login`).send({
                email: 'emadis4chargmail.com',
                password: '123456',
            });
            expect(response.status).toBe(422);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Validation Failed',
                data: expect.arrayContaining([expect.objectContaining({
                    location: expect.stringMatching(/body/),
                    path: expect.stringMatching(/password|email/),
                    msg: expect.any(String),
                    type: expect.stringMatching(/field/)
                })])
            }));
        });

        test('POST /auth/login <=user not found=> 401 && { message }', async () => {
            const response = await request(app).post(`${fixedPart}/auth/login`).send({
                email: 'noUser@gmail.com',
                password: 'correct',
            });
            expect(response.status).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'User not found'
            }));
        });

        test('POST /auth/login <=wrong password=> 401 && { message }', async () => {
            const response = await request(app).post(`${fixedPart}/auth/login`).send({
                email: 'emadis4char@gmail.com',
                password: 'notCorrect'
            });
            expect(response.status).toBe(401);
            expect(response.body).toEqual(expect.objectContaining({
                message: 'Wrong Password'
            }));
        })

        test('POST /auth/login <=success=> 200 && { message, token, userId }', async () => {
            const user = await User.findOne({ email: 'emadis4char@gmail.com' });
            const response = await request(app).post(`${fixedPart}/auth/login`).send({
                email: 'emadis4char@gmail.com',
                password: '123456'
            });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                token: expect.any(String),
                userId: user._id.toString(),
                role: user.role
            }));
        })
    })
})