jest.mock('../../../models/pending_user');
jest.mock('../../../models/user');
jest.mock('nodemailer');

const nodemailer = require('nodemailer')
const User = require('../../../models/user');
const UserPending = require('../../../models/pending_user');

const { confirmEmail } = require('../../../controllers/auth');


const mockRequest = jest.fn().mockReturnValue({
    query: {
        t: 'realtoken',
        e: 'emadis4char@gmail.com'
    }
});

const jsonMock = jest.fn();
const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnValue({ json: jsonMock })
});

const mockNext = jest.fn();

describe('Auth Controller - confirmEmail', () => {

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

    test('should throw an error if token is not valid', async () => {
        UserPending.findOne.mockResolvedValue(null);
        await confirmEmail(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'Invalid Token'
        }));
        expect(UserPending.findOne).toHaveBeenCalled();
        expect(User).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();
    });

    test('should throw an error if failed to save user to database', async () => {
        UserPending.findOne.mockResolvedValue({
            englishName: 'Emma Watson',
            arabicName: 'واتسون',
            email: 'emadis4char@gmail.com',
            password: '123456789',
            token: 'realtoken',
            role: '0'
        });
        User.mockReturnValue({
            save: jest.fn().mockRejectedValue(new Error('Failed to save user'))
        });
        await confirmEmail(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'Failed to save user'
        }));
        expect(UserPending.findOne).toHaveBeenCalled();
        expect(User).toHaveBeenCalled();
        expect(User().save).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
        expect(createTransportSpy().sendMail).not.toHaveBeenCalled();

    });

    test('should send a response with status code 201 on success and send mail', async () => {
        UserPending.findOne.mockResolvedValue({ dummy: 'name' });
        User.mockReturnValue({
            save: jest.fn().mockResolvedValue({ _id: '555666' })
        });
        await confirmEmail(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(UserPending.findOne).toHaveBeenCalled();
        expect(User).toHaveBeenCalled();
        expect(User().save).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith({
            message: 'User Confirmed',
            userId: '555666'
        });
        expect(createTransportSpy).toHaveBeenCalled();
        expect(createTransportSpy().sendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: mockRequest().query.e,
            subject: "Welcome To The Family!",
            html: '<h1>Email Confirmed Successfully, Start Your Reading Journey Now.</h1>' //token here as the mocked return value from crypto
        }))

    })
})