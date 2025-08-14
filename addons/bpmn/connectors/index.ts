import { Connector } from './Connector';
import { HTTPConnector } from './HTTPConnector';
import { EmailConnector } from './EmailConnector';
import { S3Connector } from './S3Connector';

/**
 * Registre de connecteurs et API d'extension
 */
class ConnectorRegistry {
  private connectors = new Map<string, Connector>();

  register(connector: Connector) {
    this.connectors.set(connector.name, connector);
  }

  get(name: string) {
    return this.connectors.get(name);
  }

  async execute(name: string, params: unknown) {
    const connector = this.get(name);
    if (!connector) {
      throw new Error(`Connecteur ${name} introuvable`);
    }
    return connector.execute(params);
  }
}

const registry = new ConnectorRegistry();

// Enregistrement des connecteurs natifs
registry.register(new HTTPConnector());
registry.register(new EmailConnector());
registry.register(new S3Connector());

// API minimaliste pour les développeurs
export function registerConnector(connector: Connector) {
  registry.register(connector);
}

export function getConnector(name: string) {
  return registry.get(name);
}

export function executeConnector(name: string, params: unknown) {
  return registry.execute(name, params);
}

export { Connector, HTTPConnector, EmailConnector, S3Connector };
