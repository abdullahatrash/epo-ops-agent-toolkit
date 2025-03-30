import EPOAPI from '../shared/api';
import tools from '../shared/tools';
import {isToolAllowed, type Configuration} from '../shared/configuration';
import type {Tool} from 'ai';
import EPOTool from './tool';

class EPOAgentToolkit {
  private _epo: EPOAPI;
  tools: {[key: string]: Tool};

  constructor({
    key,
    secret,
    configuration = {allowedTools: []},
  }: {
    key: string;
    secret: string;
    configuration?: Configuration;
  }) {
    this._epo = new EPOAPI(key, secret, configuration.context || {});
    this.tools = {};

    const filteredTools = tools(configuration.context || {}).filter(
      (tool) =>
        !configuration.allowedTools?.length ||
        isToolAllowed(tool, configuration)
    );

    filteredTools.forEach((tool) => {
      this.tools[tool.method] = EPOTool(
        this._epo,
        tool.method,
        tool.description,
        tool.parameters
      );
    });
  }

  /**
   * Get all available tools
   */
  getTools(): {[key: string]: Tool} {
    return this.tools;
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools[name];
  }
}

export default EPOAgentToolkit;
