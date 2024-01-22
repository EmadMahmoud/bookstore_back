jest.mock('../../../models/category');


const Category = require('../../../models/category');
const { getCategories } = require('../../../controllers/category');



const mockRequest = jest.fn();

const jsonMock = jest.fn();
const mockResponse = jest.fn().mockReturnValue({
    status: jest.fn().mockReturnValue({ json: jsonMock })
});

const mockNext = jest.fn();

describe('Category Controller - getCategories', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if find() promise got rejected', async () => {
        // Mock the implementation of find() for Category
        const mockFind = jest.fn().mockRejectedValue(new Error('No function find'));
        Category.find.mockReturnValue({ exec: mockFind });
        await getCategories(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
            message: 'No function find'
        }));
        expect(Category.find).toHaveBeenCalled();
        expect(mockResponse().status).not.toHaveBeenCalled();
    });

    test('should get all categories', async () => {
        // Mock the implementation of find() for Category
        const mockFind = jest.fn().mockResolvedValue([{ name: 'Category 1' }, { name: 'Category 2' }]);
        const mockCountDocuments = jest.fn().mockResolvedValue(2);
        Category.find.mockReturnValue({ exec: mockFind, countDocuments: mockCountDocuments });
        await getCategories(mockRequest(), mockResponse(), mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(Category.find).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalled();
        expect(mockResponse().status).toHaveBeenCalledTimes(1);
        expect(mockResponse().status).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledTimes(1);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Categories Fetched Successfully', categories: [{ name: 'Category 1' }, { name: 'Category 2' }], totalCategories: 2 });
    });
});

