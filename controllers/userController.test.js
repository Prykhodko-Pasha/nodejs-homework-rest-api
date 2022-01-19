/* eslint-disable no-undef */
const app = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

const { DB_HOST } = process.env;

describe("user login controller tests", () => {
  let server, response;
  const loginData = {
    email: "example@example.com",
    password: "examplepassword",
  };
  const responseData = {
    email: expect.any(String),
    subscription: expect.any(String),
  };

  beforeAll(async () => {
    server = app.listen(3000);
    await mongoose.connect(DB_HOST);
    response = await request(app).post("/api/users/login").send(loginData);
  });
  afterAll(() => {
    mongoose.connection.close();
    server.close();
  });

  test("the response should have a status-code 200", async () => {
    expect(response.statusCode).toBe(200);
  });

  test("the response should return a token", async () => {
    expect(response._body.token).toBeTruthy();
  });

  test("the response should return a 'user' object with 2 fields 'email' and 'subscription', having the data type String", async () => {
    expect(response._body.user).toMatchObject(responseData);
  });
});
