import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { SnippetsServices } from './services';
import { SnippetObject } from './dto';
import { SuccessResponse } from 'src/utilities/Success.Response';

@Controller('snippet')
export class SnippetsController {
  constructor(
    private snippetsServices: SnippetsServices
  ) { }

  @Get('lists')
  async getAllSnippets() {
    console.log("Fetched")
    const data = await this.snippetsServices.getSnippetsList()
    return SuccessResponse("Snippets user", data)
  }

  @Post('create')
  async createSnippets(@Body(
    new ParseArrayPipe({ items: SnippetObject })
  ) snippetClient: SnippetObject[]) {

    await this.snippetsServices.createSnippets(snippetClient)
    return SuccessResponse("Snippet created")
  }


}
