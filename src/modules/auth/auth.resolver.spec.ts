import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ErrorCode } from '~/common/enums';
import { LoginResponse } from './auth.model';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let authResolver: AuthResolver;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authResolver = moduleRef.get(AuthResolver);
    authService = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('should return access token', async () => {
      const result: LoginResponse = {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      };
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      await expect(
        authResolver.login({
          username: 'superadmin',
          password: 'envy1362987212538',
        }),
      ).resolves.toEqual(result);
    });

    it('should throw invalid password error', async () => {
      const error = new BadRequestException(ErrorCode.INCORRECT_PASSWORD);
      jest.spyOn(authService, 'login').mockRejectedValue(error);
      await expect(
        authResolver.login({
          username: 'superadmin',
          password: '123456',
        }),
      ).rejects.toThrow(error);
    });
  });
});
