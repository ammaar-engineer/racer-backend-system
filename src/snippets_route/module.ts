import { Module } from "@nestjs/common";
import { SnippetsController } from "./controller";
import { SnippesServicesModule } from "./services";

@Module({
  controllers: [SnippetsController],
  imports: [SnippesServicesModule]
})
export class SnippetsRouteModule { }
