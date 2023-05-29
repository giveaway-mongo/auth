import { Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from '@src/modules/auth/auth.service';
import { Public } from '@src/decorators/auth-public.decorator';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get()
  findAll() {
    return [];
  }
}
