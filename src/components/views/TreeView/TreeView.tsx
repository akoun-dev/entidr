import React, { useState, useCallback, useMemo } from 'react';
import { TreeViewHeader } from './TreeViewHeader';
import { TreeViewToolbar } from './TreeViewToolbar';
import { TreeViewNode } from './TreeViewNode';
import { TreeViewBranch } from './TreeViewBranch';
import { TreeViewSearch } from './TreeViewSearch';

export interface TreeNode {
  id: string;
  label: string;
  type?: 'folder' | 'file' | 'item';
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  metadata?: Record<string, any>;
  parentId?: string;
  level?: number;
}

export interface TreeViewProps {
  data: TreeNode[];
  className?: string;
  multiSelect?: boolean;
  expandOnSelect?: boolean;
  showIcons?: boolean;
  showLines?: boolean;
  draggable?: boolean;
  searchable?: boolean;
  onNodeSelect?: (node: TreeNode) => void;
  onNodeExpand?: (node: TreeNode) => void;
  onNodeCollapse?: (node: TreeNode) => void;
  onNodeDrop?: (draggedNode: TreeNode, targetNode: TreeNode, position: 'inside' | 'before' | 'after') => void;
  onNodeDoubleClick?: (node: TreeNode) => void;
  onNodeRightClick?: (node: TreeNode, event: React.MouseEvent) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  className = '',
  multiSelect = false,
  expandOnSelect = false,
  showIcons = true,
  showLines = true,
  draggable = false,
  searchable = false,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  onNodeDrop,
  onNodeDoubleClick,
  onNodeRightClick
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>(data);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);

  // Mettre à jour les données quand elles changent
  React.useEffect(() => {
    setTreeData(data);
  }, [data]);

  // Filtrer les données en fonction du terme de recherche
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return treeData;

    const filterNodes = (nodes: TreeNode[], term: string): TreeNode[] => {
      return nodes
        .map(node => ({ ...node }))
        .filter(node => {
          const matchesSearch = node.label.toLowerCase().includes(term.toLowerCase());

          if (node.children) {
            const filteredChildren = filterNodes(node.children, term);
            node.children = filteredChildren;
            return matchesSearch || filteredChildren.length > 0;
          }

          return matchesSearch;
        });
    };

    return filterNodes(treeData, searchTerm);
  }, [treeData, searchTerm]);

  const handleNodeSelect = useCallback((node: TreeNode) => {
    let newSelectedNodes: string[];

    if (multiSelect) {
      const isSelected = selectedNodes.includes(node.id);
      if (isSelected) {
        newSelectedNodes = selectedNodes.filter(id => id !== node.id);
      } else {
        newSelectedNodes = [...selectedNodes, node.id];
      }
    } else {
      newSelectedNodes = [node.id];
    }

    setSelectedNodes(newSelectedNodes);
    onNodeSelect?.(node);

    // Gérer l'expansion automatique
    if (expandOnSelect && node.children && node.children.length > 0) {
      if (expandedNodes.has(node.id)) {
        handleNodeCollapse(node);
      } else {
        handleNodeExpand(node);
      }
    }
  }, [multiSelect, selectedNodes, expandedNodes, expandOnSelect, onNodeSelect]);

  const handleNodeExpand = useCallback((node: TreeNode) => {
    const newExpandedNodes = new Set(expandedNodes);
    newExpandedNodes.add(node.id);
    setExpandedNodes(newExpandedNodes);
    onNodeExpand?.(node);
  }, [expandedNodes, onNodeExpand]);

  const handleNodeCollapse = useCallback((node: TreeNode) => {
    const newExpandedNodes = new Set(expandedNodes);
    newExpandedNodes.delete(node.id);
    setExpandedNodes(newExpandedNodes);
    onNodeCollapse?.(node);
  }, [expandedNodes, onNodeCollapse]);

  const handleExpandAll = useCallback(() => {
    const getAllNodeIds = (nodes: TreeNode[]): string[] => {
      return nodes.reduce<string[]>((acc, node) => {
        acc.push(node.id);
        if (node.children) {
          acc.push(...getAllNodeIds(node.children));
        }
        return acc;
      }, []);
    };

    const allIds = getAllNodeIds(treeData);
    setExpandedNodes(new Set(allIds));
  }, [treeData]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleDragStart = useCallback((node: TreeNode) => {
    if (!draggable) return;
    setDraggedNode(node);
  }, [draggable]);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleDrop = useCallback((targetNode: TreeNode, position: 'inside' | 'before' | 'after') => {
    if (!draggedNode || !onNodeDrop) return;

    onNodeDrop(draggedNode, targetNode, position);
    setDraggedNode(null);
  }, [draggedNode, onNodeDrop]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setIsSearchOpen(true);
    }
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchTerm('');
    setIsSearchOpen(false);
  }, []);

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="tree-node-wrapper">
        <TreeViewNode
          node={node}
          level={level}
          isExpanded={isExpanded}
          isSelected={isSelected}
          showIcons={showIcons}
          showLines={showLines}
          draggable={draggable}
          isDragged={draggedNode?.id === node.id}
          onSelect={() => handleNodeSelect(node)}
          onExpand={() => handleNodeExpand(node)}
          onCollapse={() => handleNodeCollapse(node)}
          onDoubleClick={() => onNodeDoubleClick?.(node)}
          onRightClick={(e) => onNodeRightClick?.(node, e)}
          onDragStart={() => handleDragStart(node)}
          onDragEnd={handleDragEnd}
        />

        {hasChildren && isExpanded && (
          <TreeViewBranch
            nodes={node.children!}
            level={level + 1}
            showLines={showLines}
            onNodeSelect={handleNodeSelect}
            onNodeExpand={handleNodeExpand}
            onNodeCollapse={handleNodeCollapse}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeRightClick={onNodeRightClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggedNode={draggedNode}
            selectedNodes={selectedNodes}
            expandedNodes={expandedNodes}
            renderNode={renderNode}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`tree-view ${className}`}>
      <TreeViewHeader
        title="Vue Arborescente"
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onSearchOpen={() => setIsSearchOpen(true)}
        searchable={searchable}
      />

      <TreeViewToolbar
        searchable={searchable}
        onSearchOpen={() => setIsSearchOpen(true)}
        onSearch={handleSearch}
        searchTerm={searchTerm}
      />

      {isSearchOpen && (
        <TreeViewSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onClose={handleSearchClose}
          placeholder="Rechercher dans l'arborescence..."
        />
      )}

      <div className="tree-view-content p-2">
        {filteredData.length > 0 ? (
          filteredData.map(node => renderNode(node))
        ) : (
          <div className="text-gray-500 text-center p-4">
            {searchTerm ? 'Aucun résultat trouvé' : 'Aucune donnée à afficher'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeView;
