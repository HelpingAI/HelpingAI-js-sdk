import { Model } from './types';

/**
 * Models API interface for managing HelpingAI models.
 */
export class Models {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  /**
   * List all available models.
   * @returns Promise<Model[]> A list of available models.
   * @throws {APIError} If the request fails.
   * @throws {AuthenticationError} If authentication fails.
   */
  async list(): Promise<Model[]> {
    try {
      const response = await this.client.request(
        'GET',
        '/models',
        {},
        { authRequired: false } // Models endpoint is public
      );
      
      if (Array.isArray(response)) {
        return response.map((modelId: string) => this.createModelFromId(modelId));
      }
      
      // Fallback response handling
      return [];
    } catch (error) {
      // Fallback to hardcoded models if API call fails
      return [
        {
          id: 'Helpingai3-raw',
          name: 'HelpingAI3 Raw',
          description: 'Advanced language model with enhanced emotional intelligence and contextual awareness',
          object: 'model'
        },
        {
          id: 'Dhanishtha-2.0-preview',
          name: 'Dhanishtha-2.0 Preview', 
          description: 'Revolutionary reasoning AI model with intermediate thinking capabilities and multi-phase reasoning',
          object: 'model'
        }
      ];
    }
  }

  /**
   * Retrieve a specific model.
   * @param modelId The ID of the model to retrieve.
   * @returns Promise<Model> The requested model.
   * @throws {Error} If the model doesn't exist.
   */
  async retrieve(modelId: string): Promise<Model> {
    // Define available models with detailed information
    const availableModels: Record<string, Model> = {
      'Helpingai3-raw': {
        id: 'Helpingai3-raw',
        name: 'HelpingAI3 Raw',
        description: 'Advanced language model with enhanced emotional intelligence, trained on emotional dialogues, therapeutic exchanges, and crisis response scenarios',
        object: 'model'
      },
      'Dhanishtha-2.0-preview': {
        id: 'Dhanishtha-2.0-preview',
        name: 'Dhanishtha-2.0 Preview',
        description: 'World\'s first intermediate thinking model with multi-phase reasoning, self-correction capabilities, and structured emotional reasoning (SER)',
        object: 'model'
      }
    };

    if (modelId in availableModels) {
      return availableModels[modelId];
    }

    // Try to get from API as fallback
    try {
      const models = await this.list();
      const model = models.find(m => m.id === modelId);
      if (model) {
        return model;
      }
    } catch (error) {
      // Ignore error and continue to throw below
    }

    throw new Error(`Model '${modelId}' not found. Available models: ${Object.keys(availableModels).join(', ')}`);
  }

  private createModelFromId(modelId: string): Model {
    return {
      id: modelId,
      name: modelId,
      object: 'model'
    };
  }
}
