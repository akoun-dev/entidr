import React, { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, File, MoreVertical } from 'lucide-react';
import { TreeNode } from './TreeView';

export interface TreeViewNodeProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  showIcons: boolean;
  showLines: boolean;
  draggable: boolean;
  isDragged: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onDoubleClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const TreeViewNode: React.FC<TreeViewNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  showIcons,
  showLines,
  draggable,
  isDragged,
  onSelect,
  onExpand,
  onCollapse,
  onDoubleClick,
  onRightClick,
  onDragStart,
  onDragEnd
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children && node.children.length > 0;
  const isFolder = node.type === 'folder' || hasChildren;

  // Gestion du drag & drop
  useEffect(() => {
    const nodeElement = nodeRef.current;
    if (!nodeElement || !draggable) return;

    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', node.id);
        e.dataTransfer.effectAllowed = 'move';
      }
      onDragStart();
    };

    const handleDragEnd = () => {
      onDragEnd();
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        const draggedNodeId = e.dataTransfer.getData('text/plain');
        // Logique de drop à implémenter au niveau du parent
      }
    };

    nodeElement.addEventListener('dragstart', handleDragStart);
    nodeElement.addEventListener('dragend', handleDragEnd);
    nodeElement.addEventListener('dragover', handleDragOver);
    nodeElement.addEventListener('drop', handleDrop);

    return () => {
      nodeElement.removeEventListener('dragstart', handleDragStart);
      nodeElement.removeEventListener('dragend', handleDragEnd);
      nodeElement.removeEventListener('dragover', handleDragOver);
      nodeElement.removeEventListener('drop', handleDrop);
    };
  }, [draggable, node.id, onDragStart, onDragEnd]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasChildren) {
      if (isExpanded) {
        onCollapse();
      } else {
        onExpand();
      }
    }

    onSelect();
  };

  const handleExpandCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasChildren) {
      if (isExpanded) {
        onCollapse();
      } else {
        onExpand();
      }
    }
  };

  const getNodeIcon = () => {
    if (!showIcons) return null;

    if (node.icon) {
      // Si une icône personnalisée est fournie, l'utiliser
      return <span className="node-icon">{node.icon}</span>;
    }

    if (isFolder) {
      return isExpanded ? (
        <Folder className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-gray-500" />
      );
    }

    return <File className="h-4 w-4 text-gray-400" />;
  };

  const getIndentStyle = () => {
    return {
      paddingLeft: `${level * 20 + 8}px`
    };
  };

  const getNodeClasses = () => {
    const baseClasses = 'tree-node flex items-center space-x-1 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors';
    const selectedClasses = isSelected ? 'bg-blue-100 text-blue-700' : '';
    const disabledClasses = node.disabled ? 'opacity-50 cursor-not-allowed' : '';
    const draggedClasses = isDragged ? 'opacity-50' : '';

    return `${baseClasses} ${selectedClasses} ${disabledClasses} ${draggedClasses}`;
  };

  const renderExpandCollapseIcon = () => {
    if (!hasChildren) {
      return <span className="w-4 h-4" />; // Espace vide pour l'alignement
    }

    return (
      <button
        onClick={handleExpandCollapseClick}
        className="expand-collapse-btn flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded transition-colors"
        title={isExpanded ? 'Réduire' : 'Développer'}
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        )}
      </button>
    );
  };

  const renderLines = () => {
    if (!showLines) return null;

    return (
      <div className="tree-lines absolute left-0 top-0 bottom-0 pointer-events-none">
        {/* Lignes verticales pour l'indentation */}
        {Array.from({ length: level }).map((_, index) => (
          <div
            key={index}
            className="absolute w-px bg-gray-300"
            style={{
              left: `${index * 20 + 12}px`,
              top: 0,
              bottom: 0
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={nodeRef}
      className="tree-node-container relative"
      draggable={draggable && !node.disabled}
      style={getIndentStyle()}
    >
      {renderLines()}

      <div
        className={getNodeClasses()}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onRightClick}
        title={node.label}
      >
        {renderExpandCollapseIcon()}

        {getNodeIcon()}

        <span className="node-label flex-1 truncate text-sm">
          {node.label}
        </span>

        {/* Badge pour les métadonnées optionnelles */}
        {node.metadata && node.metadata.badge && (
          <span className="node-badge text-xs px-1 py-0.5 bg-gray-200 text-gray-600 rounded">
            {node.metadata.badge}
          </span>
        )}

        {/* Menu contextuel */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRightClick(e);
          }}
          className="context-menu-btn opacity-0 hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          title="Plus d'options"
        >
          <MoreVertical className="h-3 w-3 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default TreeViewNode;
