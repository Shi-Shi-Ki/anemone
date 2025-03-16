import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

export type SignIn = {
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(name: string, password: string): Promise<SignIn> {
    const user = await this.usersService.findOne(name);
    if (user.password !== password) {
      throw new UnauthorizedException();
    }
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.name,
      }),
    };
  }
}
