jest.mock('../../../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('express-validator');


const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const User = require('../../../models/user');
const { login } = require('../../../controllers/auth');


const mockRequest = jest.fn().mockReturnValue({
    body: {
        email: 'emmawatson@gmail.com',
        password: '123456'
    }
});

const jsonMock = jest.fn();
const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnValue({ json: jsonMock })
});

const mockNext = jest.fn();



describe('Auth Controller - login', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if validation fails', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'validate password fail' }])
        });
        await login(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 422,
            data: [{ msg: 'validate password fail' }],
            message: 'Validation Failed'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(User).not.toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should throw an error if user not found', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findOne.mockResolvedValue(null);
        await login(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'User not found'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should throw an error if password is incorrect', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findOne.mockResolvedValue({ password: '123456' });
        bcrypt.compare.mockReturnValue(false);
        await login(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'Wrong Password'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(bcrypt.compare).toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should throw an error if failed to generate token', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findOne.mockResolvedValue({ password: '123456', _id: { toString: jest.fn() } });
        bcrypt.compare.mockReturnValue(true);
        jwt.sign.mockImplementation(() => {
            throw new Error('jwt error')
        });
        await login(mockRequest(), mockResponse(), mockNext);
        expect(validationResult).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(bcrypt.compare).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'jwt error'
        }));
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should send a response with status code 200 on success', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findOne.mockResolvedValue({ password: '123456', _id: { toString: jest.fn().mockReturnValue('123f3s') }, role: '0' });
        bcrypt.compare.mockReturnValue(true);
        jwt.sign.mockReturnValue('token');
        await login(mockRequest(), mockResponse(), mockNext);
        expect(validationResult).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(bcrypt.compare).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith({
            token: 'token',
            userId: expect.any(String),
            role: '0'
        });
    });
})