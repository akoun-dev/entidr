import { Connector } from './Connector';

/**
 * Connecteur S3 fictif pour téléverser des fichiers
 */
export class S3Connector implements Connector {
  name = 's3';

  async execute(params: { bucket: string; key: string; content: Buffer | string }): Promise<unknown> {
    // Implémentation fictive, à remplacer par le SDK AWS
    console.log(`Téléversement de ${params.key} dans ${params.bucket}`);
    return true;
  }
}
