import type { RouteDocInfo } from './types';

export function generateRouteDocs(routes: RouteDocInfo[]): string {
  let markdown = '# Route Documentation\n\n';
  
  const processRoute = (route: RouteDocInfo, depth = 0) => {
    const indent = '  '.repeat(depth);
    markdown += `${indent}- **${route.path}**\n`;
    markdown += `${indent}  - Name: ${route.name ? String(route.name) : 'unnamed'}\n`;
    
    if (route.meta) {
      const meta = route.meta;
      markdown += `${indent}  - Title: ${meta.title || 'N/A'}\n`;
      markdown += `${indent}  - Auth Required: ${meta.requiresAuth ? 'Yes' : 'No'}\n`;
      if (meta.permissions) {
        markdown += `${indent}  - Permissions: ${meta.permissions.join(', ')}\n`;
      }
    }

    if (route.children) {
      markdown += `${indent}  - Children:\n`;
      route.children.forEach(child => processRoute(child, depth + 1));
    }
  };

  routes.forEach(route => processRoute(route));
  return markdown;
}