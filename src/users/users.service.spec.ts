import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

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

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('UsersService', () => {
  let usersService: UsersService;
  let jwtService: JwtService;
  let usersRepository: MockRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    usersRepository = moduleRef.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'host',
      password: 'hostpw',
      role: UserRole.Host,
    };

    it('Should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1 });

      const result = await usersService.createAccount(createAccountArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: createAccountArgs.email,
      });

      expect(result).toEqual({
        ok: false,
        error: `There is a user with that email already`,
      });
    });

    it('Should create new user', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      const result = await usersService.createAccount(createAccountArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: createAccountArgs.email,
      });

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(result).toMatchObject({
        ok: true,
        error: null,
      });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
});
