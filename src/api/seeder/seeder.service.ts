import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "../users/schema/user.schema";
import { defaultUsers } from "./data/default-users";

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async seedDefaultRolesUsers() {
    for (const item of defaultUsers) {
      const exists = await this.userModel.findOne({
        employeeCode: item.employeeCode,
      });
      if (exists) continue;

      // console.log(item);
      const userDoc = new this.userModel({
        name: item.name,
        employeeCode: item.employeeCode,
        phone: item.phone,
        teamId: new Types.ObjectId(),
        territoryId: new Types.ObjectId(),
        role: item.role,
      } as any);

      // console.log(userDoc);
      await userDoc.save();
    }

    return { message: "Default Super Admin, Admin, and User seeded" };
  }
}
