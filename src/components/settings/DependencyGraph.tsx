import React, { useMemo } from 'react';
import type { Module } from '../../types/module';

type GraphNode = {
  id: string;
  label: string;
  installed: boolean;
  active: boolean;
  installable: boolean;
  missing?: boolean;
};

type PositionedNode = GraphNode & {
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Edge = { from: string; to: string };

export interface DependencyGraphProps {
  modules: Module[];
  includeMissing?: boolean;
}

/**
 * Simple SVG dependency graph without external libs.
 * Layout: layered by dependency depth; edges from dependency -> module.
 */
export const DependencyGraph: React.FC<DependencyGraphProps> = ({ modules, includeMissing = true }) => {
  const { nodes, edges, width, height } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const depsByNode = new Map<string, string[]>();

    // Seed nodes from modules
    for (const m of modules) {
      nodeMap.set(m.name, {
        id: m.name,
        label: m.displayName || m.name,
        installed: !!m.installed,
        active: !!m.active,
        installable: m.installable !== false,
      });
      depsByNode.set(m.name, Array.isArray(m.dependencies) ? m.dependencies : []);
    }

    // Include missing dependency nodes if requested
    if (includeMissing) {
      for (const [name, deps] of depsByNode.entries()) {
        for (const d of deps) {
          if (!nodeMap.has(d)) {
            nodeMap.set(d, {
              id: d,
              label: d,
              installed: false,
              active: false,
              installable: false,
              missing: true,
            });
            // No further deps known for missing nodes
            if (!depsByNode.has(d)) depsByNode.set(d, []);
          }
        }
      }
    }

    // Compute levels (depth from root deps)
    const memo = new Map<string, number>();
    const visiting = new Set<string>();

    const getLevel = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!;
      if (visiting.has(id)) return 0; // cycle guard
      visiting.add(id);
      const deps = depsByNode.get(id) || [];
      let lvl = 0;
      for (const d of deps) {
        lvl = Math.max(lvl, getLevel(d) + 1);
      }
      visiting.delete(id);
      memo.set(id, lvl);
      return lvl;
    };

    const allIds = Array.from(nodeMap.keys());
    allIds.forEach(getLevel);

    // Group nodes by level
    const byLevel = new Map<number, GraphNode[]>();
    for (const id of allIds) {
      const lvl = memo.get(id) || 0;
      const n = nodeMap.get(id)!;
      const arr = byLevel.get(lvl) || [];
      arr.push(n);
      byLevel.set(lvl, arr);
    }

    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

    const nodeWidth = 180;
    const nodeHeight = 56;
    const hSpacing = 140;
    const vSpacing = 60;
    const margin = 30;

    const maxPerLevel = Math.max(1, ...Array.from(byLevel.values()).map(arr => arr.length));
    const svgWidth = margin * 2 + levels.length * nodeWidth + Math.max(0, levels.length - 1) * hSpacing;
    const svgHeight = margin * 2 + maxPerLevel * nodeHeight + Math.max(0, maxPerLevel - 1) * vSpacing;

    // Position nodes
    const positioned: Record<string, PositionedNode> = {};
    levels.forEach((lvl, colIndex) => {
      const arr = byLevel.get(lvl) || [];
      arr.forEach((n, rowIndex) => {
        const x = margin + colIndex * (nodeWidth + hSpacing);
        // Center vertically within column
        const totalHeight = arr.length * nodeHeight + Math.max(0, arr.length - 1) * vSpacing;
        const startY = (svgHeight - totalHeight) / 2;
        const y = startY + rowIndex * (nodeHeight + vSpacing);
        positioned[n.id] = { ...n, level: lvl, x, y, width: nodeWidth, height: nodeHeight };
      });
    });

    // Build edges dep -> module
    const edgeList: Edge[] = [];
    for (const [mod, deps] of depsByNode.entries()) {
      for (const d of deps) {
        if (!nodeMap.has(d)) continue;
        edgeList.push({ from: d, to: mod });
      }
    }

    return {
      nodes: Object.values(positioned),
      edges: edgeList,
      width: svgWidth,
      height: svgHeight,
    };
  }, [modules, includeMissing]);

  if (!modules || modules.length === 0) {
    return <div className="text-sm text-muted-foreground">Aucun module à afficher</div>;
  }

  return (
    <div className="w-full overflow-auto">
      <svg width={width} height={height}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const src = nodes.find(n => n.id === e.from)!;
          const dst = nodes.find(n => n.id === e.to)!;
          if (!src || !dst) return null;
          const x1 = src.x + src.width;
          const y1 = src.y + src.height / 2;
          const x2 = dst.x;
          const y2 = dst.y + dst.height / 2;
          const dx = Math.max(40, (x2 - x1) / 2);
          const c1x = x1 + dx;
          const c1y = y1;
          const c2x = x2 - dx;
          const c2y = y2;
          const d = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
          return <path key={`e-${i}`} d={d} stroke="#94a3b8" strokeWidth={1.5} fill="none" markerEnd="url(#arrow)" />;
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const stroke = n.missing ? '#f59e0b' : n.installed ? (n.active ? '#10b981' : '#9ca3af') : '#64748b';
          const fill = n.missing ? '#fff7ed' : '#ffffff';
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <rect width={n.width} height={n.height} rx={8} ry={8} fill={fill} stroke={stroke} strokeWidth={2} />
              <text x={12} y={22} fontSize={13} fill="#111827" fontWeight={600}>
                {n.label}
              </text>
              <text x={12} y={40} fontSize={11} fill="#6b7280">
                {n.missing ? 'Manquant' : n.installed ? (n.active ? 'Installé • Actif' : 'Installé • Inactif') : (n.installable ? 'Non installé' : 'Non disponible')}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><span style={{ display:'inline-block', width:12, height:12, background:'#10b981', borderRadius:2 }} /> Installé & actif</div>
        <div className="flex items-center gap-2"><span style={{ display:'inline-block', width:12, height:12, background:'#9ca3af', borderRadius:2 }} /> Installé & inactif</div>
        <div className="flex items-center gap-2"><span style={{ display:'inline-block', width:12, height:12, background:'#ffffff', border:'2px solid #64748b', borderRadius:2 }} /> Non installé</div>
        <div className="flex items-center gap-2"><span style={{ display:'inline-block', width:12, height:12, background:'#fff7ed', border:'2px solid #f59e0b', borderRadius:2 }} /> Manquant</div>
      </div>
    </div>
  );
};

export default DependencyGraph;

