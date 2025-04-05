import { Test, TestingModule } from "@nestjs/testing"
import { GoogleAuthValidationService } from "./google-auth-validation.service"

describe("GoogleAuthValidationService", () => {
  let service: GoogleAuthValidationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAuthValidationService],
    }).compile()

    service = module.get<GoogleAuthValidationService>(GoogleAuthValidationService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
