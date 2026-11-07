import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { isDevelopment, isTest } from "./environment";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// LOG_LEVEL (set in fly.toml) wins; otherwise verbose in dev, quiet elsewhere.
const level = (): string => {
  const fromEnv = process.env.LOG_LEVEL;
  if (fromEnv && fromEnv in levels) return fromEnv;
  if (isTest) return "error";
  return isDevelopment ? "debug" : "warn";
};

// File logs are opt-out via LOG_FILE_ENABLED=false and always off under test.
const fileLoggingEnabled =
  !isTest && process.env.LOG_FILE_ENABLED !== "false";

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const consoleTransport = () =>
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  });

const rotatingFile = (name: string, options: Record<string, unknown> = {}) =>
  new DailyRotateFile({
    filename: path.join("logs", `${name}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    ...options,
  });

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transports: winston.transport[] = [consoleTransport()];
const exceptionHandlers: winston.transport[] = [consoleTransport()];
const rejectionHandlers: winston.transport[] = [consoleTransport()];

if (fileLoggingEnabled) {
  transports.push(
    rotatingFile("error", { level: "error", format: jsonFormat }),
    rotatingFile("combined", { format: jsonFormat })
  );
  exceptionHandlers.push(rotatingFile("exceptions"));
  rejectionHandlers.push(rotatingFile("rejections"));
}

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers,
  rejectionHandlers,
});

export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
