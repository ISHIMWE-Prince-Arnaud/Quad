import { logError } from "../errorHandling";

export class SecureStorage {
  private static readonly PREFIX = "quad_secure_";

  static setItem(key: string, value: string, encrypt = false): void {
    const finalKey = this.PREFIX + key;
    let finalValue = value;

    if (encrypt) {
      finalValue = btoa(value);
    }

    try {
      localStorage.setItem(finalKey, finalValue);
    } catch (error) {
      logError(error, { component: "SecureStorage", action: "setItem", metadata: { key } });
    }
  }

  static getItem(key: string, decrypt = false): string | null {
    const finalKey = this.PREFIX + key;

    try {
      const value = localStorage.getItem(finalKey);
      if (!value) return null;

      if (decrypt) {
        return atob(value);
      }

      return value;
    } catch (error) {
      logError(error, { component: "SecureStorage", action: "getItem", metadata: { key } });
      return null;
    }
  }

  static removeItem(key: string): void {
    const finalKey = this.PREFIX + key;
    localStorage.removeItem(finalKey);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}
