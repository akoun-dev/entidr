import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddonManager from '@/core/AddonManager';
import { MenuDefinition } from '@/types/addon';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';

type GlobalSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
};

function normalizeMenus(menus: MenuDefinition[]) {
  const byId = new Map<string, MenuDefinition>();
  menus.forEach(m => byId.set(m.id, m));
  return menus
    .filter(m => !!m.route)
    .map(m => {
      let path: string[] = [m.name];
      // Build breadcrumb-like label from parents
      let p = m.parent ? byId.get(m.parent) : undefined;
      const safety = new Set<string>();
      while (p && !safety.has(p.id)) {
        safety.add(p.id);
        path.unshift(p.name);
        p = p.parent ? byId.get(p.parent) : undefined;
      }
      return {
        id: m.id,
        name: m.name,
        route: m.route as string,
        label: path.join(' › '),
        group: path[0],
      };
    });
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange, initialQuery }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery || '');

  useEffect(() => {
    if (open) setQuery(initialQuery || '');
  }, [open, initialQuery]);

  const items = useMemo(() => normalizeMenus(AddonManager.getAllMenus()), []);
  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach(it => {
      const arr = (map.get(it.group) as any) || [];
      arr.push(it);
      map.set(it.group, arr);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Rechercher une page, un module..."
        autoFocus
      />
      <CommandList>
        <CommandEmpty>Aucun résultat</CommandEmpty>
        {groups.map(([group, arr]) => (
          <CommandGroup key={group} heading={group}>
            {arr.map((it) => (
              <CommandItem
                key={it.id}
                onSelect={() => {
                  onOpenChange(false);
                  navigate(it.route);
                }}
              >
                {it.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;

