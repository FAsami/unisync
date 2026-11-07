import request from "supertest";
import app from "../../src/index";

export const api = () => request(app);
export const SERVER_SECRET = process.env.SERVER_AUTH_SECRET as string;
