import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from './entities/user.entity';
import { UsersService } from 'src/users/users.service';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'this-is-token'),
  verify: jest.fn(),
};
describe('UsersService', () => {
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: Mock;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        JwtService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockRepository },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('createAccount', () => {
    it('', () => {
      expect('').toBe('');
    });
  });
});
