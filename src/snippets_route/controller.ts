import { Body, Controller, Get, ParseArrayPipe, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SnippetsServices } from './services';
import { SnippetObject } from './dto';
import { SuccessResponse } from 'src/utilities/Success.Response';

@ApiTags('snippets')
@Controller('snippets')
export class SnippetsController {
  constructor(
    private snippetsServices: SnippetsServices
  ) { }

  @Get('list')
  @ApiOperation({ summary: 'Get all snippets' })
  @ApiResponse({ status: 200, description: 'Snippets retrieved successfully' })
  async getAllSnippets() {
    const data = await this.snippetsServices.getSnippetsList()
    return SuccessResponse("Snippets user", data)
  }

  @Post('create')
  @ApiOperation({ summary: 'Create one or more snippets' })
  @ApiBody({ type: [SnippetObject], description: 'Array of snippet objects to create' })
  @ApiResponse({ status: 200, description: 'Snippets created successfully' })
  async createSnippets(@Body(
    new ParseArrayPipe({ items: SnippetObject })
  ) snippetClient: SnippetObject[]) {

    await this.snippetsServices.createSnippets(snippetClient)
    return SuccessResponse("Snippet created")
  }


}
