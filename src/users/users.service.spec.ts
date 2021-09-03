import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

const userId = 1;
const testToken = 'this-is-token';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => testToken),
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
      usersRepository.findOne.mockResolvedValue({ id: userId });

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

    it('Should fail if error occurs', async () => {
      jest.spyOn(usersRepository, 'findOne').mockImplementation(async () => {
        throw new Error();
      });

      const result = await usersService.createAccount(createAccountArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: createAccountArgs.email,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Could not create account',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'id',
      password: 'pw',
    };
    it('should fail if user not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await usersService.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if password not correct', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: userId,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      });

      const result = await usersService.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });

    it('should fail if error occurs', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await usersService.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: Error(),
      });
    });

    it('should return token if login success', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: userId,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      });

      const result = await usersService.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        ok: true,
        token: testToken,
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: userId,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);

      const result = await usersService.findById(userId);

      expect(usersRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOneOrFail).toHaveBeenCalledWith(findByIdArgs);

      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await usersService.findById(userId);

      expect(result).toEqual({
        ok: false,
        error: 'User Not Found',
      });
    });
  });

  describe('editProfile', () => {
    const editProfileEmail = {
      email: 'willbeupdate',
    };

    const editProfilePassword = {
      password: 'willbeupdate',
    };
    it('should fail if user is not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await usersService.editProfile(userId, {
        ...editProfileEmail,
        ...editProfilePassword,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile',
      });
    });

    it('should update email if email is inserted', async () => {
      usersRepository.findOne.mockResolvedValue({});

      const result = await usersService.editProfile(userId, editProfileEmail);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileEmail);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should update password if password is inserted', async () => {
      usersRepository.findOne.mockResolvedValue({});

      const result = await usersService.editProfile(
        userId,
        editProfilePassword,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfilePassword);

      expect(result).toEqual({
        ok: true,
      });
    });
  });
});
