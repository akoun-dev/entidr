import { Connector } from './Connector';

/**
 * Connecteur email simplifié
 */
export class EmailConnector implements Connector {
  name = 'email';

  async execute(params: { to: string; subject: string; body: string }): Promise<unknown> {
    // Implémentation simplifiée, à remplacer par un service réel
    console.log(`Envoi d'un email à ${params.to} : ${params.subject}`);
    return true;
  }
}
