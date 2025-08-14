import crypto from 'crypto';

/**
 * Stockage sécurisé des secrets avec chiffrement et rotation de clé
 */
export class SecretStore {
  private secrets = new Map<string, string>();
  private key: Buffer;

  constructor(key?: Buffer) {
    this.key = key || crypto.randomBytes(32);
  }

  private encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('hex');
  }

  private decrypt(payload: string): string {
    const buf = Buffer.from(payload, 'hex');
    const iv = buf.subarray(0, 16);
    const tag = buf.subarray(16, 32);
    const data = buf.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }

  setSecret(name: string, value: string) {
    this.secrets.set(name, this.encrypt(value));
  }

  getSecret(name: string) {
    const enc = this.secrets.get(name);
    return enc ? this.decrypt(enc) : undefined;
  }

  /**
   * Rotation de la clé de chiffrement
   */
  rotateKey(newKey: Buffer) {
    const entries = Array.from(this.secrets.entries()).map(([k, v]) => [k, this.decrypt(v)] as [string, string]);
    this.key = newKey;
    this.secrets.clear();
    for (const [k, v] of entries) {
      this.setSecret(k, v);
    }
  }
}
