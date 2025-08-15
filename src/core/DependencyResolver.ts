import semver from 'semver';
import { AddonManifest } from '../types/addon';
import logger from '../utils/logger';

class DependencyResolver {
  static async resolveDependencies(
    manifest: AddonManifest,
    availableModules: AddonManifest[]
  ): Promise<{ valid: boolean; conflicts: string[] }> {
    const conflicts: string[] = [];

    // Vérifier les dépendances principales
    if (manifest.dependencies) {
      for (const [depName, versionRange] of Object.entries(manifest.dependencies)) {
        const depModule = availableModules.find(m => m.name === depName);
        if (!depModule) {
          conflicts.push(`Dependency missing: ${depName}@${versionRange}`);
          continue;
        }

        if (!semver.satisfies(depModule.version, versionRange)) {
          conflicts.push(`Version conflict: ${depName}@${depModule.version} does not satisfy ${versionRange}`);
        }
      }
    }

    // Vérifier les peerDependencies
    if (manifest.peerDependencies) {
      for (const [peerName, versionRange] of Object.entries(manifest.peerDependencies)) {
        const peerModule = availableModules.find(m => m.name === peerName);
        if (!peerModule) {
          conflicts.push(`Peer dependency missing: ${peerName}@${versionRange}`);
          continue;
        }

        if (!semver.satisfies(peerModule.version, versionRange)) {
          conflicts.push(`Peer version conflict: ${peerName}@${peerModule.version} does not satisfy ${versionRange}`);
        }
      }
    }

    // Vérifier les conflits explicites
    if (manifest.conflicts) {
      for (const conflictName of manifest.conflicts) {
        if (availableModules.some(m => m.name === conflictName)) {
          conflicts.push(`Explicit conflict: ${conflictName} should not be installed`);
        }
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts
    };
  }

  static generateDependencyGraph(manifests: AddonManifest[]): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    for (const manifest of manifests) {
      graph[manifest.name] = [
        ...(manifest.dependencies ? Object.keys(manifest.dependencies) : []),
        ...(manifest.peerDependencies ? Object.keys(manifest.peerDependencies) : [])
      ];
    }

    return graph;
  }
}

export default DependencyResolver;