export type Object = 'publishedData' | 'family' | 'image' | 'search' | 'number';

export type Permission = 'read' | 'download';

export type Actions = {
  [K in Object]?: {
    [K in Permission]?: boolean;
  };
};

export type Context = {
  // Connection context settings
  acceptType?: string;
  middlewares?: any[];

  // Custom output settings
  outputDir?: string;
};

export type Configuration = {
  actions?: Actions;
  context?: Context;
  allowedTools?: string[];
};

export function isToolAllowed(
  tool: {method: string; actions: {[key: string]: {[action: string]: boolean}}},
  configuration: Configuration
): boolean {
  // If allowedTools is explicitly provided, use that for filtering
  if (configuration.allowedTools && configuration.allowedTools.length > 0) {
    return configuration.allowedTools.includes(tool.method);
  }

  // If no actions are configured, allow all tools
  if (!configuration.actions) {
    return true;
  }

  // Check if all required resource permissions are allowed
  return Object.keys(tool.actions).every((resource) => {
    // For each resource.permission pair, check the configuration
    const permissions = tool.actions[resource as Object];

    return Object.keys(permissions).every((permission) => {
      return (
        configuration.actions?.[resource as Object]?.[
          permission as Permission
        ] === true
      );
    });
  });
}
