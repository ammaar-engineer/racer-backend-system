import { IsNotEmpty, IsString } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class SnippetObject {
  @ApiProperty({
    description: 'Unique alias identifier for the snippet',
    example: ':docker',
  })
  @IsString()
  @IsNotEmpty()
  alias: string

  @ApiProperty({
    description: 'Description of the snippet',
    example: 'Snippet to start docker',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'Content of the snippet',
    example: 'sudo systemctl start docker',
  })
  @IsString()
  @IsNotEmpty()
  content: string
}
