jest.mock('../../../models/category');

const Category = require('../../../models/category');
const { getCategory } = require('../../../controllers/category');


const mockRequest = jest.fn().mockReturnValue({
    params: {
        categoryId: '5c0f66b979af55031b34728a'
    }
});

const jsonMock = jest.fn();
const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnValue({ json: jsonMock })
});

const mockNext = jest.fn();

describe('Category Controller - getCategory', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if findById() promise got rejected', async () => {
        // Mock the implementation of findById() for Category
        const mockFindById = jest.fn().mockRejectedValue(new Error('No function findById'));
        Category.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockFindById }) });
        await getCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            message: 'No function findById',
            statusCode: 500
        }));
        expect(Category.findById).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
    });

    test('should throw an error if category not found', async () => {
        // Mock the implementation of findById() for Category
        const mockFindById = jest.fn().mockResolvedValue(null);
        Category.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockFindById }) });
        await getCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Category not found',
            statusCode: 404
        }));
        expect(Category.findById).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
    });

    test('should get category', async () => {
        // Mock the implementation of findById() for Category
        const mockFindById = jest.fn().mockResolvedValue({ name: 'Category 1' });
        Category.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockFindById }) });
        await getCategory(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(Category.findById).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledTimes(1);
        expect(mockResponse().status).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledTimes(1);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Category Fetched Successfully', category: { name: 'Category 1' } });
    });
})