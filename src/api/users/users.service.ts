import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { CreateUserWithPhoneRequest } from './dto/register.req.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}


async createUserWithPhoneNumber(data: CreateUserWithPhoneRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
    }).save();
  }


  async create(data: CreateUserRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
    }).save();
  }

  // async getUser(query: FilterQuery<User>) {
  //   const user = (await this.userModel.findOne(query)).toObject();
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   return user;
  // }

  async getUser(query: FilterQuery<User>, includePassword = false) {
    let dbQuery = this.userModel.findOne(query);
    if (includePassword) {
      dbQuery = dbQuery.select('+password'); // Ensure password is included in the query
    }
    const user = await dbQuery.lean(); // Convert to plain object
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  async getUserRefreshToken(query: FilterQuery<User>) {
    let dbQuery = this.userModel.findOne(query);
      ///dbQuery = dbQuery.select('+refreshToken'); // Ensure password is included in the query
    const user = await dbQuery.lean(); // Convert to plain object
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  

  async getUserRefreshToken1(query: FilterQuery<User>) {
    const dbQuery = this.userModel.findOne(query).select('+refreshToken'); // Add select here
    const user = await dbQuery.lean();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUsers() {
    return this.userModel.find({});
  }

  async updateUser(query: FilterQuery<User>, data: UpdateQuery<User>) {
    return this.userModel.findOneAndUpdate(query, data);
  }

  async getOrCreateUser(data: CreateUserRequest) {
    const user = await this.userModel.findOne({ email: data.email });
    if (user) {
      return user;
    }
    return this.create(data);
  }
}
