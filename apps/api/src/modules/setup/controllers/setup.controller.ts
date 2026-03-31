import { Controller, Get, Post, Body } from '@nestjs/common';
import { SetupService } from '../services/setup.service';
import { Public } from '../../../common/decorators/public.decorator';
import { RunSetupDto } from '../dto/run-setup.dto';

@Controller('setup')
export class SetupController {
  constructor(private setupService: SetupService) {}

  @Public()
  @Get('status')
  async getStatus() {
    const complete = await this.setupService.isSetupComplete();
    return { complete };
  }

  @Public()
  @Post('run')
  async runSetup(@Body() dto: RunSetupDto) {
    return this.setupService.runSetup(dto);
  }
}
