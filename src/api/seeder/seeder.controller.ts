import { Controller, Post } from "@nestjs/common";
import { SeederService } from "./seeder.service";

@Controller("seeder")
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post("/default-users")
  seedDefaultUsers() {
    return this.seederService.seedDefaultRolesUsers();
  }
}
