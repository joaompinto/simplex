import { configManager } from './config-manager.js';
import { messageManager } from './message-manager.js';

export class CommandManager {
    constructor() {
        this.commands = new Map();
        this.initializeCommands();
    }

    initializeCommands() {
        this.registerCommand('help', {
            description: 'Show available commands and their usage',
            usage: '/help',
            handler: () => this.getHelpText()
        });

        this.registerCommand('configure', {
            description: 'Configure the AI provider settings',
            usage: '/configure provider_name base_url api_key',
            handler: (args) => this.handleConfigure(args)
        });

        this.registerCommand('ask', {
            description: 'Send a request without using edit tools',
            usage: '/ask your question or request',
            handler: (args) => this.handleAsk(args)
        });

        this.registerCommand('reset', {
            description: 'Clear all messages from the chat',
            usage: '/reset',
            handler: () => this.handleReset()
        });
    }

    registerCommand(name, { description, usage, handler }) {
        this.commands.set(name, { description, usage, handler });
    }

    handleCommand(text) {
        if (!text.startsWith('/')) return null;

        const parts = text.slice(1).split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        const cmd = this.commands.get(command);
        if (!cmd) {
            return {
                content: `# Error: Unknown Command\n\`${command}\` is not a valid command.\nType \`/help\` to see available commands.`,
                type: 'system',
                className: 'error'
            };
        }

        try {
            const result = cmd.handler(args);
            return {
                content: result,
                type: 'system'
            };
        } catch (error) {
            return {
                content: `# Error: Command Failed\n\`${error.message}\``,
                type: 'system',
                className: 'error'
            };
        }
    }

    async handleConfigure([provider_name, base_url, api_key]) {
        if (!provider_name || !base_url || !api_key) {
            throw new Error('Missing required arguments. Usage: /configure provider_name base_url api_key');
        }

        try {
            const config = {
                provider: provider_name,
                base_url: base_url,
                api_key: api_key
            };

            const result = await configManager.handleConfigValidation(config);
            
            if (result.success) {
                return `# Configuration Updated\nSuccessfully configured ${provider_name}.\n\n*Provider settings have been saved.*`;
            } else {
                throw new Error(result.error || 'Configuration validation failed');
            }
        } catch (error) {
            throw new Error(`Failed to update configuration: ${error.message}`);
        }
    }

    async handleAsk(args) {
        if (!args || args.length === 0) {
            throw new Error('Please provide a question or request after /ask');
        }

        const request = args.join(' ');
        
        // Send special flag to disable edit tools
        try {
            await messageManager.sendMessage(request, { noEditTools: true });
            // Don't return anything - this prevents the empty system message
            return;
        } catch (error) {
            throw error;
        }
    }

    handleReset() {
        messageManager.chatBox.clearMessages();
        return `# Chat Reset\nAll messages have been cleared.\n\n*Type \`/help\` to see available commands.*`;
    }

    getHelpText() {
        const commandList = Array.from(this.commands.entries())
            .map(([name, cmd]) => `### ${cmd.usage}\n${cmd.description}`)
            .join('\n\n');

        return `# Available Commands\n\n${commandList}\n\n*Use \`/help\` to show this message again*`;
    }
}
