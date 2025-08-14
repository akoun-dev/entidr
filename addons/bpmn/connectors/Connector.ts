export interface Connector {
  /** Nom unique du connecteur */
  name: string;
  /** Exécute l'action du connecteur */
  execute(params: unknown): Promise<unknown>;
}
