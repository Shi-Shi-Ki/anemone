import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { GoogleAuthValidationService } from "./google-auth/google-auth-validation.service"
import { BearerStrategy } from "./google-auth/bearer-strategy"
import { UtilModule } from "@/util/util.module"

@Module({
  imports: [UtilModule],
  providers: [AuthService, GoogleAuthValidationService, BearerStrategy],
  exports: [BearerStrategy, GoogleAuthValidationService],
})
export class AuthModule {}
