import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { User } from './schema/user.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { CreateUserWithPhoneRequest } from './dto/register.req.dto';
import {IPaginationOptions} from 'src/utils/types/pagination-options'

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

  // async findManyWithPagination(paginationOptions: IPaginationOptions) {
  //   const users = this.userModel.find({
  //     skip: (paginationOptions.page - 1) * paginationOptions.limit,
  //     take: paginationOptions.limit,
  //   });
  //   console.log(users);
  //   return users;
  // }


  async findManyWithPagination(paginationOptions: IPaginationOptions) {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;
  
    // option A: chaining
    const users = await this.userModel
      .find()        // empty filter => all users
      .skip(skip)
      .limit(limit)
      .exec();      // execute the query
  
    // option B: passing options object
    // const users = await this.userModel.find({}, null, { skip, limit });
    return users;
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
