const supertest = require('supertest');
const mongoose = require('mongoose');
const Student = require('../../src/models/student'); // mongo-client
const app = require('../../src/app');
const { generateToken } = require('../../src/utils/jwt');

const Token = generateToken({ id: 'fake_id' });

const request = supertest(app);

const createStudentRequest = async (body) => {
  return request
    .post('/v1/students')
    .send(body)
    .set('Authorization', `Bearer ${Token}`);
};

describe('/v1/students', () => {
  // hooks -> life cycle method
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Create', () => {
    beforeEach(async () => {
      await Student.deleteMany({}).exec();
    });
    it('should save the student if request is valid', async () => {
      const validStudent = {
        firstName: 'xxx',
        lastName: 'yyy',
        email: 'xxx@example.com',
      };
      const res = await createStudentRequest(validStudent);
      expect(res.statusCode).toBe(201);
      const student = await Student.findOne(validStudent).exec(); // null
      expect(student).toBeTruthy();
    });

    it.each`
      field          | value
      ${'firstName'} | ${undefined}
      ${'email'}     | ${'abc@a.c'}
      ${'firstName'} | ${'a'}
    `('should return 400 when $field is $value', async ({ field, value }) => {
      const validStudent = {
        firstName: 'xxx',
        lastName: 'yyy',
        email: 'xxx@example.com',
      };
      const invalidStudent = {
        ...validStudent,
        [field]: value,
      };
      const res = await createStudentRequest(invalidStudent);
      expect(res.statusCode).toBe(400);
    });
  });
});
