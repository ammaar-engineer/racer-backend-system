import { IsNotEmpty, IsString } from "class-validator"

export class SnippetObject {
  @IsString()
  @IsNotEmpty()
  alias: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  content: string
}
