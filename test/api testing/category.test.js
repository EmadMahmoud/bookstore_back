// const app = require('../../app');
// const request = require('supertest');
// const User = require('../../models/user');
// const Category = require('../../models/category');


// describe('Category Routes', () => {

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('Add Category', () => {

//         beforeAll(async () => {
//             await User.deleteMany();
//             await Category.deleteMany();
//         })


//         test.only('POST /category/add <=validation fail=> 422 && { message, data}', async () => {
//             const response = await request(app).post('/category/add').send({
//                 name: 'Horror'
//             });
//             expect(response.status).toBe(422);
//             expect(response.body).toEqual(expect.objectContaining({
//                 message: 'Validation Failed',
//                 data: expect.arrayContaining([expect.objectContaining({
//                     location: expect.stringMatching(/body/),
//                     path: expect.stringMatching(/description|name/),
//                     msg: expect.any(String),
//                     type: expect.stringMatching(/field/)
//                 })])
//             }));
//         });

//         test('POST /category/add <=success=> 201 && { message, category }', async () => {
//             const response = await request(app).post('/category/add').send({
//                 name: 'Horror',
//                 description: 'Horror Books are the best'
//             });
//             expect(response.status).toBe(201);
//             expect(response.body).toEqual(expect.objectContaining({
//                 message: 'Category Created',
//                 category: expect.objectContaining({
//                     name: 'Horror',
//                     description: 'Horror Books are the best'
//                 })
//             }));
//         });

//         test('POST /category/add <=user not authorized=> 401 && { message }', async () => {
//             const response = await request(app).post('/category/add').send({
//                 name: 'Horror',
//                 description: 'Horror Books are the best'
//             });
//             expect(response.status).toBe(401);
//             expect(response.body).toEqual(expect.objectContaining({
//                 message: 'Not Authorized'
//             }));
//         });
//     });
// })

