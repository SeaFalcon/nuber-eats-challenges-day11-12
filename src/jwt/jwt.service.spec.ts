import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from './jwt.constants';
import * as jwt from 'jsonwebtoken';
import { JwtService } from './jwt.service';

const TEST_KEY = 'this-is-test-key';
const USER_ID = 1;
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});
describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: CONFIG_OPTIONS, useValue: { privateKey: TEST_KEY } },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
  });

  describe('sign', () => {
    it('should return a signed token', async () => {
      const token = await jwtService.sign(USER_ID);

      expect(typeof token).toBe('string');

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });

  describe('verify', () => {
    it('should return the decoded value', async () => {
      const TOKEN = 'TOKEN';

      const decodedValue = await jwtService.verify(TOKEN);

      expect(decodedValue).toEqual({ id: USER_ID });

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
