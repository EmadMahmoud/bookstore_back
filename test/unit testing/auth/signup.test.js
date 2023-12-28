jest.mock('../../../models/pending_user');
jest.mock('../../../models/user');
jest.mock('nodemailer');
jest.mock('crypto');
jest.mock('bcryptjs');
jest.mock('express-validator');

const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserPending = require('../../../models/pending_user');
const User = require('../../../models/user');
const { signup } = require('../../../controllers/auth');


const mockRequest = jest.fn().mockReturnValue({
    body: {
        enName: 'Emma Watson',
        arName: 'واتسون',
        email: 'emadis4char@gmail.com',
        password: '123456',
        userName: 'emma'
    }
});

const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

const mockNext = jest.fn();

describe('Auth Controller - Signup', () => {

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

    test('should throw an error if validation fails', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'validate password fail' }])
        });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 422,
            data: [{ msg: 'validate password fail' }],
            message: 'Validation Failed'
        }));
        expect(UserPending).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should throw an error if user already exists', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        });
        User.findOne.mockResolvedValue({ email: 'emadis4char@gmail.com' });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 422,
            message: 'User already exists'
        }));
        expect(UserPending).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should throw an error if failed to generate a token with crypto', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        });
        User.findOne.mockResolvedValue(null);
        crypto.randomBytes.mockImplementation(() => { throw new Error('crypto error') });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'crypto error'
        }));
        expect(UserPending).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should throw an error if failed to hash password with bcrypt', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        });
        User.findOne.mockResolvedValue(null);
        crypto.randomBytes.mockReturnValue({ toString: jest.fn().mockReturnValue('token') });
        bcrypt.hash.mockImplementation(() => { throw new Error('bcrypt error') });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'bcrypt error'
        }));
        expect(UserPending).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should throw an error if failed to save user to database', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        });
        User.findOne.mockResolvedValue(null);
        crypto.randomBytes.mockReturnValue({ toString: jest.fn().mockReturnValue('token') });
        bcrypt.hash.mockResolvedValue('hashedPassword');
        UserPending.mockReturnValue({
            save: jest.fn().mockRejectedValue(new Error('database error'))
        });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'database error'
        }));
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should send a response with status code 201 on success and send mail', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        });
        User.findOne.mockResolvedValue(null);
        crypto.randomBytes.mockReturnValue({ toString: jest.fn().mockReturnValue('token') });
        bcrypt.hash.mockResolvedValue('hashedPassword');
        UserPending.mockReturnValue({
            save: jest.fn().mockResolvedValue({
                _id: 'blahis003sheep'
            })
        });
        await signup(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(UserPending).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledWith(201);
        expect(mockResponse().json).toHaveBeenCalledWith({
            message: 'User created, Still to be confirmed',
            userId: 'blahis003sheep'
        });
        expect(createTransportSpy).toHaveBeenCalled();
        expect(createTransportSpy().sendMail).toHaveBeenCalled();
        expect(createTransportSpy().sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: mockRequest().body.email,
            subject: "Confirm Email",
            html: expect.stringMatching(/token/) //token here as the mocked return value from crypto
        }))
    })
})
