import { Test, TestingModule } from "@nestjs/testing";
import { PermissionService } from "./permission.service";
import { getModelToken } from "@nestjs/mongoose";
import { RolePermission } from "./schema/role-permission.schema";

describe("PermissionService", () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken(RolePermission.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
