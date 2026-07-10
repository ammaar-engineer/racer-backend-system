import { Module, Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Snippets } from "src/db/entities";
import { Repository, QueryFailedError } from "typeorm";

@Injectable()
export class SnippetsServices {
  constructor(
    @InjectRepository(Snippets) private snippetRepository: Repository<Snippets>,
  ) { }

  async getSnippetsList() {
    const snippetsRaw = await this.snippetRepository.find();
    const snippets = snippetsRaw.map((data) => ({
      alias: data.alias,
      content: data.content,
      description: data.description
    }));

    return { snippets };
  }

  async createSnippets(snippetDataArray: Array<{ alias: string, description: string, content: string }>) {
    try {
      // Clear all existing snippets
      await this.snippetRepository.clear();

      // Create new snippet entities
      const snippets = snippetDataArray.map(data => this.snippetRepository.create(data));

      // Bulk save all snippets
      await this.snippetRepository.save(snippets);

      return { inserted: snippets.length };
    } catch (err: any) {
      if (err instanceof QueryFailedError && err.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Data already exist');
      }
      throw err;
    }
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Snippets])],
  providers: [SnippetsServices],
  exports: [SnippetsServices]
})
export class SnippesServicesModule { }
