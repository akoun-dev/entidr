import React, { useRef, useEffect, useState } from 'react';
import { TreeNode } from './TreeView';

export interface TreeViewBranchProps {
  nodes: TreeNode[];
  level: number;
  showLines: boolean;
  onNodeSelect: (node: TreeNode) => void;
  onNodeExpand: (node: TreeNode) => void;
  onNodeCollapse: (node: TreeNode) => void;
  onNodeDoubleClick?: (node: TreeNode) => void;
  onNodeRightClick?: (node: TreeNode, event: React.MouseEvent) => void;
  onDragStart: (node: TreeNode) => void;
  onDragEnd: () => void;
  onDrop: (targetNode: TreeNode, position: 'inside' | 'before' | 'after') => void;
  draggedNode: TreeNode | null;
  selectedNodes: string[];
  expandedNodes: Set<string>;
  renderNode: (node: TreeNode, level: number) => React.ReactNode;
}

export const TreeViewBranch: React.FC<TreeViewBranchProps> = ({
  nodes,
  level,
  showLines,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  onNodeDoubleClick,
  onNodeRightClick,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedNode,
  selectedNodes,
  expandedNodes,
  renderNode
}) => {
  const branchRef = useRef<HTMLDivElement>(null);
  const [dropTarget, setDropTarget] = useState<{
    nodeId: string;
    position: 'inside' | 'before' | 'after';
  } | null>(null);

  // Gestion du drag & drop pour la branche
  useEffect(() => {
    const branchElement = branchRef.current;
    if (!branchElement) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!draggedNode || !dropTarget) return;

      const targetNode = nodes.find(node => node.id === dropTarget.nodeId);
      if (targetNode) {
        onDrop(targetNode, dropTarget.position);
      }

      setDropTarget(null);
    };

    const handleDragLeave = () => {
      setDropTarget(null);
    };

    branchElement.addEventListener('dragover', handleDragOver);
    branchElement.addEventListener('drop', handleDrop);
    branchElement.addEventListener('dragleave', handleDragLeave);

    return () => {
      branchElement.removeEventListener('dragover', handleDragOver);
      branchElement.removeEventListener('drop', handleDrop);
      branchElement.removeEventListener('dragleave', handleDragLeave);
    };
  }, [draggedNode, dropTarget, nodes, onDrop]);

  const handleNodeDragOver = (nodeId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const nodeElement = e.currentTarget as HTMLElement;
    const rect = nodeElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'inside' | 'before' | 'after';

    // Déterminer la position du drop
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside';
    }

    setDropTarget({ nodeId, position });
  };

  const getDropIndicatorClasses = (nodeId: string, position: 'inside' | 'before' | 'after') => {
    const baseClasses = 'drop-indicator absolute bg-blue-400 transition-all duration-200';

    switch (position) {
      case 'before':
        return `${baseClasses} left-0 right-0 h-0.5 -top-0.5`;
      case 'after':
        return `${baseClasses} left-0 right-0 h-0.5 -bottom-0.5`;
      case 'inside':
        return `${baseClasses} left-0 right-0 top-0 bottom-0 bg-blue-100 border-2 border-blue-400 border-dashed rounded`;
      default:
        return baseClasses;
    }
  };

  const renderDropIndicator = (nodeId: string) => {
    if (!dropTarget || dropTarget.nodeId !== nodeId || !draggedNode) return null;

    // Empêcher le drop sur soi-même
    if (draggedNode.id === nodeId) return null;

    return (
      <div className={getDropIndicatorClasses(nodeId, dropTarget.position)} />
    );
  };

  const renderBranchLines = () => {
    if (!showLines) return null;

    return (
      <div className="branch-lines absolute left-0 top-0 bottom-0 pointer-events-none">
        {/* Ligne verticale pour connecter les nœuds de cette branche */}
        <div
          className="absolute w-px bg-gray-300"
          style={{
            left: `${level * 20 + 12}px`,
            top: '8px',
            bottom: '8px'
          }}
        />

        {/* Lignes horizontales pour chaque nœud */}
        {nodes.map((_, index) => (
          <div
            key={index}
            className="absolute w-4 bg-gray-300"
            style={{
              left: `${level * 20 + 12}px`,
              top: `${index * 32 + 16}px`,
              height: '1px'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={branchRef}
      className="tree-view-branch relative"
      style={{
        marginLeft: `${level * 20}px`
      }}
    >
      {renderBranchLines()}

      <div className="branch-content space-y-1">
        {nodes.map((node) => {
          const isExpanded = expandedNodes.has(node.id);
          const isSelected = selectedNodes.includes(node.id);
          const isDragged = draggedNode?.id === node.id;

          return (
            <div
              key={node.id}
              className="branch-node-wrapper relative"
              onDragOver={(e) => handleNodeDragOver(node.id, e)}
              onDragLeave={() => {
                // Ne pas effacer le drop target immédiatement pour permettre le drag entre nœuds
              }}
            >
              {renderDropIndicator(node.id)}

              {renderNode({
                ...node,
                level,
                expanded: isExpanded,
                selected: isSelected
              }, level)}

              {/* Conteneur pour les enfants si le nœud est développé */}
              {node.children && node.children.length > 0 && isExpanded && (
                <TreeViewBranch
                  nodes={node.children}
                  level={level + 1}
                  showLines={showLines}
                  onNodeSelect={onNodeSelect}
                  onNodeExpand={onNodeExpand}
                  onNodeCollapse={onNodeCollapse}
                  onNodeDoubleClick={onNodeDoubleClick}
                  onNodeRightClick={onNodeRightClick}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  draggedNode={draggedNode}
                  selectedNodes={selectedNodes}
                  expandedNodes={expandedNodes}
                  renderNode={renderNode}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Indicateur de drop vide pour la fin de la branche */}
      {dropTarget && !nodes.find(node => node.id === dropTarget.nodeId) && (
        <div
          className="drop-zone-empty h-8 border-2 border-dashed border-blue-400 rounded bg-blue-50 flex items-center justify-center text-blue-600 text-sm"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedNode) {
              // Créer un nœud cible virtuel pour le drop à la fin
              const virtualTarget: TreeNode = {
                id: 'virtual-end',
                label: '',
                type: 'folder',
                children: []
              };
              onDrop(virtualTarget, 'inside');
            }
          }}
        >
          Déposer ici
        </div>
      )}
    </div>
  );
};

export default TreeViewBranch;
