import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { User } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';
import { LoginReqWithEmailDto, LoginReqWithPhoneDto } from './dto/login.req.dto';
import { CreateUserWithPhoneRequest, CreateUserWithEmailRequest } from './dto/register.req.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,

  ) { }


  async createUserWithPhoneNumber(data: CreateUserWithPhoneRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
    }).save();
  }


  async createUserWithEmail(data: CreateUserWithEmailRequest) {
    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
    }).save();
  }


  async login(user: User, response: Response, redirect = false) {

    console.log('AuthService login called');
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    // const expiresAccessToken = new Date();
    // expiresAccessToken.setMilliseconds(
    //   expiresAccessToken.getTime() +
    //     parseInt(
    //       this.configService.getOrThrow<string>('jwt.accessExpirationTime'),
    //     ),
    // );


    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }
  }


  // async loginWithPhoneNumber(phoneNumber: string, response: Response) {

  // async loginWithPhoneNumber(dto: LoginReqPhoneDto): Promise<LoginResDto> {

  async loginWithPhoneNumber(dto: LoginReqWithPhoneDto, response: Response, redirect = false): Promise<any> {
    const includePassword = true;
    const user = await this.usersService.getUser({ phoneNumber: dto.phoneNumber }, includePassword);
    if (!user) {
      throw new UnauthorizedException('Invalid phone number.');
    }
    const isPasswordValid = user && (await this.verifyPassword(dto.password, user.password));
    console.log('isPasswordValid', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );


    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }

    // return {
    //   accessToken,
    //   refreshToken,
    //   expiresAccessToken,
    //   expiresRefreshToken,
    // };

  }

  async loginWithEmail(dto: LoginReqWithEmailDto, response: Response, redirect = false): Promise<any> {
    const includePassword = true;
    const user = await this.usersService.getUser({ email: dto.email },includePassword);
    console.log('user', user);

    if (!user) {
      throw new UnauthorizedException('Invalid Email.');
    }
    const isPasswordValid = user && (await this.verifyPassword(dto.password, user.password));
    console.log('isPasswordValid email', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
      parseInt(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      ),
    );

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    await this.usersService.updateUser(
      { _id: user._id },
      { $set: { refreshToken: await hash(refreshToken, 10) } },
    );


    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }

  }


  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    console.log('AuthService verifyPassword called');
    console.log('Password:', password);
    console.log('Hashed Password:', hashedPassword);

    try {
      return await compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  };

  async verifyUser(email: string, password: string) {
    console.log('AuthService verifyUser called');
    const includePassword = true;
    try {
      const user = await this.usersService.getUser({ email }, includePassword);
      
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }


  async verifyUserByEmailOrPhone(username: string, password: string) {
    console.log('AuthService verifyUserByEmailOrPhone called');
    const includePassword = true;
    try {
      const user = await this.usersService.getUser({ email: username }, includePassword);
      
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  // async verifyUserWithPhone(phoneNumber: string, password: string) {
  //   try {
  //     const user = await this.usersService.getUser({
  //       phoneNumber,
  //     });
  //     const authenticated = await compare(password, user.password);
  //     if (!authenticated) {
  //       throw new UnauthorizedException();
  //     }
  //     return user;
  //   } catch (err) {
  //     throw new UnauthorizedException('Credentials are not valid.');
  //   }
  // }

  async veryifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ _id: userId });
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}




