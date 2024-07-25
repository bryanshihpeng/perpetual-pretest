import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';

@Controller()
export class StaticController {
  @Get()
  serveStatic(@Res() res: Response) {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  }
}
