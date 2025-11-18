import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

const getKey = (): Buffer => {
  return crypto.scryptSync(process.env.ENCRYPT_SECRET!, "salt", 32);
};

const encrypt = (text: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  const result = {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    encrypted,
  };

  return Buffer.from(JSON.stringify(result)).toString("base64");
};

const decrypt = (encrypted: string): string => {
  try {
    const decoded = decodeURIComponent(encrypted);
    const data = JSON.parse(Buffer.from(decoded, "base64").toString("utf-8"));

    const key = getKey();
    const iv = Buffer.from(data.iv, "hex");
    const authTag = Buffer.from(data.authTag, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return "";
  }
};

export { encrypt, decrypt };
