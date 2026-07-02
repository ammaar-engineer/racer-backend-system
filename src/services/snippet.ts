import { Snippets } from "../entity.js";
import { main_db } from "../main.js";
import { SqliteHandle } from "../utilities/typeorm.handle.js";

export class SnippetRouteServices {
  constructor() {}

  async getSnippetsList() {
    const snippetRepo = main_db.getRepository(Snippets);
    const snippetsRaw = await snippetRepo.find();
    const snippets = snippetsRaw.map((data) => ({
      alias: data.alias,
      content: data.content,
      description: data.description
    }));
    
    return { snippets };
  }

  async createSnippets(snippetDataArray: Array<{alias: string, description: string, content: string}>) {
    const snippetRepo = main_db.getRepository(Snippets);
    
    return await SqliteHandle(snippetRepo, async (repo) => {
      // Clear all existing snippets
      await repo.clear();
      
      // Create new snippet entities
      const snippets = snippetDataArray.map(data => repo.create(data));
      
      // Bulk save all snippets
      await repo.save(snippets);
      
      return { inserted: snippets.length };
    });
  }

  async updateSnippet(oldAlias: string, updateData: {alias?: string, description?: string, content?: string}) {
    const snippetRepo = main_db.getRepository(Snippets);
    
    return await SqliteHandle(snippetRepo, async (repo) => {
      const snippet = await repo.findOne({ where: { alias: oldAlias } });
      if (!snippet) {
        throw new Error(`Snippet with alias '${oldAlias}' not found`);
      }

      if (updateData.alias) snippet.alias = updateData.alias;
      if (updateData.description) snippet.description = updateData.description;
      if (updateData.content) snippet.content = updateData.content;

      return await repo.save(snippet);
    });
  }

  async deleteSnippet(alias: string) {
    const snippetRepo = main_db.getRepository(Snippets);
    
    return await SqliteHandle(snippetRepo, async (repo) => {
      const snippet = await repo.findOne({ where: { alias } });
      if (!snippet) {
        throw new Error(`Snippet with alias '${alias}' not found`);
      }
      
      return await repo.remove(snippet);
    });
  }
}
