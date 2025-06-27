import { Controller, Post } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  getAccess() {
    // return this.rbacService.validateAccess();
    return 'RBAC Service';
  }
}
