import { Test, TestingModule } from "@nestjs/testing";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { getModelToken } from "@nestjs/mongoose";
import { RolePermission } from "./schema/role-permission.schema";

describe("PermissionController", () => {
  let controller: PermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        PermissionService,
        {
          provide: getModelToken(RolePermission.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
