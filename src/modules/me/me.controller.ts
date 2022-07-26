import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '~/common/decorators';
import { JwtAuthGuard } from '~/common/guards';
import { JwtClaims } from '~/common/interfaces';
import { ChangePasswordBody } from './me.dto';
import { MeService } from './me.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  @Get()
  whoAmI(@CurrentUser() user: JwtClaims) {
    return this.meService.whoAmI(user.id);
  }

  @Post('changePassword')
  changePassword(
    @CurrentUser() user: JwtClaims,
    @Body() body: ChangePasswordBody,
  ) {
    const { currentPassword, newPassword } = body;
    return this.meService.changePassword(user.id, currentPassword, newPassword);
  }
}
