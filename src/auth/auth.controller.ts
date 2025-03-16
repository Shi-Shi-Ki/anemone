import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/users.service';
import { Public } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: User) {
    return this.authService.signIn(signInDto.name, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('dummy')
  getDummy() {
    return { data: 'public data!' };
  }
}
