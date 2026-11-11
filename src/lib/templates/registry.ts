import type { Template } from "./types";
import { SingleColumnTemplate } from "./single-column";

class TemplateRegistry {
  private templates: Map<string, Template> = new Map();
  private defaultTemplateId = "single-column";

  constructor() {
    this.register({
      id: "single-column",
      name: "Single Column (ATS-Safe)",
      description: "Clean, linear single-column format optimized for ATS readability and human reviewers.",
      component: SingleColumnTemplate,
    });
  }

  /**
   * Register a new CV template.
   */
  register(template: Template): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a template by its unique ID.
   * Falls back to the default single-column template if the requested ID does not exist.
   */
  get(id: string): Template {
    const template = this.templates.get(id);
    if (!template) {
      console.warn(`Template "${id}" not found. Falling back to default "${this.defaultTemplateId}".`);
      return this.templates.get(this.defaultTemplateId)!;
    }
    return template;
  }

  /**
   * List all registered templates.
   */
  getAll(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check if a template ID is registered.
   */
  has(id: string): boolean {
    return this.templates.has(id);
  }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();
