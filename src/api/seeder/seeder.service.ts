import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { defaultUsers } from "./data/default-users";
import { User } from "../users/schema/user.schema";

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
        role: item.role,
        ...(item.teamId && { teamId: new Types.ObjectId(item.teamId) }),
        ...(item.territoryId && {
          territoryId: new Types.ObjectId(item.territoryId),
        }),
      });

      // console.log(userDoc);
      await userDoc.save();
    }

    return { message: "Default Super Admin, Admin, and User seeded" };
  }
}
