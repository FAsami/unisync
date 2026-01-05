import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";
import logger from "../config/logger";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";

let firebaseInitialized = false;

try {
  if (serviceAccountBase64) {
    try {
      const buffer = Buffer.from(serviceAccountBase64, "base64");
      const serviceAccount = JSON.parse(buffer.toString("utf8"));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      logger.info(
        "Firebase Admin SDK initialized successfully from Base64 content"
      );
    } catch (error) {
      logger.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", error);
    }
  } else if (serviceAccountPath) {
    const fullPath = path.resolve(serviceAccountPath);

    if (fs.existsSync(fullPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(fullPath, "utf8"));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      firebaseInitialized = true;
      logger.info("Firebase Admin SDK initialized successfully");
    } else {
      logger.warn(
        `Firebase service account file not found at: ${fullPath}. Push notifications will be disabled.`
      );
    }
  } else {
    logger.warn(
      "Neither FIREBASE_SERVICE_ACCOUNT_PATH nor FIREBASE_SERVICE_ACCOUNT_BASE64 configured. Push notifications will be disabled."
    );
  }
} catch (error) {
  logger.error("Failed to initialize Firebase Admin SDK:", error);
}

export const messaging = firebaseInitialized
  ? admin.messaging()
  : ({
      sendEachForMulticast: async () => {
        throw new Error("Firebase not initialized");
      },
    } as any);

export const isFirebaseInitialized = () => firebaseInitialized;

export default admin;
