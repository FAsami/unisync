import dotenv from "dotenv";
import path from "path";

process.env.NODE_ENV = "test";
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

jest.setTimeout(10000);

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
