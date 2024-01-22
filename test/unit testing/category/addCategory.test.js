jest.mock('../../../models/category');
jest.mock('../../../models/user');
jest.mock('express-validator');



const { validationResult } = require('express-validator');
const Category = require("../../../models/category");
const User = require('../../../models/user');
const { addCategory } = require('../../../controllers/category');



const mockRequest = jest.fn().mockReturnValue({
    body: {
        name: 'Horror',
        description: 'Horror Books are the best'
    },
    userId: '5c0f66b979af55031b34728a'
});

const jsonMock = jest.fn();
const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnValue({ json: jsonMock })
});

const mockNext = jest.fn();


describe('Category Controller - addCategory', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if validation fails', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'validate name fail' }])
        });
        await addCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 422,
            data: [{ msg: 'validate name fail' }],
            message: 'Validation Failed'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(Category).not.toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should throw an error if user not authorized', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findById.mockResolvedValue({
            role: 0
        });
        await addCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 401,
            message: 'Not Authorized'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should throw an error if category not created', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findById.mockReturnValue({
            role: 1
        });
        Category.mockReturnValue({
            save: jest.fn().mockRejectedValue(new Error('category not created'))
        });
        await addCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 500,
            message: 'category not created'
        }));
        expect(validationResult).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalled();
        expect(Category().save).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
    });

    test('should create category', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(true)
        });
        User.findById.mockReturnValue({
            role: 1
        });
        Category.mockReturnValue({
            save: jest.fn().mockResolvedValue({ name: 'Science', description: 'Science Books' })
        });
        await addCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(validationResult).toHaveBeenCalled();
        expect(User.findById).toHaveBeenCalled();
        expect(Category().save).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String),
            category: { name: 'Science', description: 'Science Books' }
        }));
    });
})