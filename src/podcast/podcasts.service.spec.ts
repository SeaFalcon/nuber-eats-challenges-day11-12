import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import { PodcastsService } from './podcasts.service';

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('PodcastService', () => {
  let podcastsService: PodcastsService;
  let podcastsRepository: MockRepository;
  let episodesRepository: MockRepository;

  const InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };
  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        PodcastsService,
        {
          provide: getRepositoryToken(Podcast),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    podcastsService = module.get<PodcastsService>(PodcastsService);
    podcastsRepository = module.get(getRepositoryToken(Podcast));
    episodesRepository = module.get(getRepositoryToken(Episode));
  });

  describe('getAllPodcasts', () => {
    it('should return all podcast list', async () => {
      podcastsRepository.find.mockResolvedValue([]);

      const result = await podcastsService.getAllPodcasts();

      expect(result).toEqual({
        ok: true,
        podcasts: [],
      });
    });

    it('should fail if error is occured', async () => {
      podcastsRepository.find.mockRejectedValue(new Error());

      const result = await podcastsService.getAllPodcasts();

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('createPodcast', () => {
    const newPodcast = {
      id: 1,
    };

    const createPodcastArgs = {
      title: '',
      category: '',
    };
    it('should create new user', async () => {
      podcastsRepository.create.mockReturnValue(newPodcast);
      podcastsRepository.save.mockResolvedValue(newPodcast);

      const result = await podcastsService.createPodcast(createPodcastArgs);

      expect(podcastsRepository.create).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.create).toHaveBeenCalledWith(createPodcastArgs);
      expect(podcastsRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.save).toHaveBeenCalledWith(newPodcast);

      expect(result).toEqual({ ok: true, ...newPodcast });
    });

    it('should fail if error is occured', async () => {
      podcastsRepository.save.mockRejectedValue(new Error());

      const result = await podcastsService.createPodcast(createPodcastArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('getPodcast', () => {
    const podcast = {
      id: 1,
    };

    const getPodcastArgs = 1;
    it('should return a specific podcast by id', async () => {
      podcastsRepository.findOne.mockResolvedValue(podcast);

      const result = await podcastsService.getPodcast(getPodcastArgs);

      expect(podcastsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual({ ok: true, podcast });
    });

    it('should fail if podcast is not found', async () => {
      podcastsRepository.findOne.mockResolvedValue(null);

      const result = await podcastsService.getPodcast(getPodcastArgs);

      expect(result).toEqual({
        ok: false,
        error: `Podcast with id ${getPodcastArgs} not found`,
      });
    });

    it('should fail if error is occured', async () => {
      podcastsRepository.findOne.mockRejectedValue(new Error());

      const result = await podcastsService.getPodcast(getPodcastArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('deletePodcast', () => {
    const podcast = {
      id: 1,
    };

    const getPodcastArgs = 1;

    const deletePodcastArgs = 1;

    // podcastsRepository.delete.mockRejectedValue
    // podcastsRepository.findOne.mockResolvedValue(null);
    it('should fail if podcast is not exist', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: false,
      });

      const result = await podcastsService.deletePodcast(getPodcastArgs);

      expect(result).toEqual({ ok: false });
    });

    it('should delete podcast', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
      });

      podcastsRepository.delete.mockResolvedValue({ ok: true });

      const result = await podcastsService.deletePodcast(getPodcastArgs);

      expect(podcastsRepository.delete).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.delete).toHaveBeenCalledWith(podcast);

      expect(result).toEqual({ ok: true });
    });

    it('should fail if error is occured', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
      });

      podcastsRepository.delete.mockRejectedValue(new Error());

      const result = await podcastsService.deletePodcast(getPodcastArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('updatePodcast', () => {
    it('should fail if podcast is not found', async () => {
      const updatePodcastArgs = {
        id: 1,
        payload: {
          rating: 3,
        },
      };

      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: false,
      });

      const result = await podcastsService.updatePodcast(updatePodcastArgs);

      expect(result).toEqual({ ok: false });
    });

    it('should update podcast', async () => {
      const getPodcastResult = {
        ok: true,
        podcast: null,
      };

      const updatePodcastArgs = {
        id: 1,
        payload: {
          title: '',
        },
      };

      podcastsRepository.save.mockResolvedValue(true);

      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
        podcast: null,
      });

      const result = await podcastsService.updatePodcast(updatePodcastArgs);

      expect(podcastsRepository.save).toHaveBeenCalledTimes(1);
      expect(podcastsRepository.save).toHaveBeenCalledWith({
        ...getPodcastResult.podcast,
        ...updatePodcastArgs.payload,
      });

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail if rating is less than one', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
      });

      const updatePodcastArgs = {
        id: 1,
        payload: {
          rating: 0,
        },
      };

      const result = await podcastsService.updatePodcast(updatePodcastArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Rating must be between 1 and 5.',
      });
    });

    it('should fail if error is occured', async () => {
      const updatePodcastArgs = {
        id: 1,
        payload: {
          rating: 0,
        },
      };

      const result = await podcastsService.updatePodcast(updatePodcastArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('getEpisodes', () => {
    const podcastId = 1;
    it('should fail if podcast is not found', async () => {
      jest
        .spyOn(podcastsService, 'getPodcast')
        .mockResolvedValue({ ok: false });

      const result = await podcastsService.getEpisodes(podcastId);

      expect(result).toEqual({ ok: false });
    });

    it('should return episodes', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
        podcast: {
          id: 1,
          category: '',
          rating: 0,
          title: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          episodes: [],
        },
      });

      const result = await podcastsService.getEpisodes(podcastId);

      expect(result).toEqual({ ok: true, episodes: [] });
    });

    it('should fail if error is occured', async () => {
      const result = await podcastsService.getEpisodes(podcastId);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('getEpisode', () => {
    const podcastId = 1;
    const episodeId = 1;

    it('should fail if episodes are not found', async () => {
      jest
        .spyOn(podcastsService, 'getEpisodes')
        .mockResolvedValue({ ok: false });

      const result = await podcastsService.getEpisode({ podcastId, episodeId });

      expect(result).toEqual({ ok: false });
    });

    it('should fail if episode is not found', async () => {
      jest
        .spyOn(podcastsService, 'getEpisodes')
        .mockResolvedValue({ ok: true, episodes: [] });

      // episodesRepository.find.mockReturnValue(false);

      const result = await podcastsService.getEpisode({ podcastId, episodeId });

      expect(result).toEqual({
        ok: false,
        error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
      });
    });

    it('should return a specific episode by id', async () => {
      const episodes = [
        {
          id: 1,
          title: '',
          category: '',
          podcast: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(podcastsService, 'getEpisodes').mockResolvedValue({
        ok: true,
        episodes,
      });

      const result = await podcastsService.getEpisode({ podcastId, episodeId });

      expect(result).toEqual({
        ok: true,
        episode: episodes[0],
      });
    });

    it('should fail if error is occured', async () => {
      const result = await podcastsService.getEpisode({ podcastId, episodeId });

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('createEpisode', () => {
    const createEpisodeArgs = {
      podcastId: 1,
      title: '',
      category: '',
    };

    it('should fail if podcast is not found', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: false,
      });

      const result = await podcastsService.createEpisode(createEpisodeArgs);

      expect(result).toEqual({ ok: false });
    });

    it('should create episode', async () => {
      jest.spyOn(podcastsService, 'getPodcast').mockResolvedValue({
        ok: true,
      });

      episodesRepository.create.mockReturnValue({ id: 1 });
      episodesRepository.save.mockResolvedValue({ id: 1 });

      const result = await podcastsService.createEpisode(createEpisodeArgs);

      expect(result).toEqual({ ok: true, id: 1 });
    });

    it('should fail if error is occured', async () => {
      const result = await podcastsService.createEpisode(createEpisodeArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('deleteEpisode', () => {
    const podcastId = 1;
    const episodeId = 1;

    const episode = {
      id: 1,
      title: '',
      category: '',
      podcast: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    it('should fail if episode is not found', async () => {
      jest.spyOn(podcastsService, 'getEpisode').mockResolvedValue({
        ok: false,
      });

      const result = await podcastsService.deleteEpisode({
        podcastId,
        episodeId,
      });

      expect(result).toEqual({ ok: false });
    });

    it('should delete episode', async () => {
      jest.spyOn(podcastsService, 'getEpisode').mockResolvedValue({
        ok: true,
        episode,
      });

      episodesRepository.delete.mockResolvedValue(true);

      const result = await podcastsService.deleteEpisode({
        podcastId,
        episodeId,
      });

      expect(episodesRepository.delete).toHaveBeenCalledTimes(1);
      expect(episodesRepository.delete).toHaveBeenCalledWith({
        id: episode.id,
      });

      expect(result).toEqual({ ok: true });
    });

    it('should fail if error is occured', async () => {
      const result = await podcastsService.deleteEpisode({
        podcastId,
        episodeId,
      });

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });

  describe('updateEpisode', () => {
    const updateEpisodeArgs = {
      podcastId: 1,
      episodeId: 1,
      title: '',
    };

    it('should fail if episode is not found', async () => {
      jest.spyOn(podcastsService, 'getEpisode').mockResolvedValue({
        ok: false,
      });

      const result = await podcastsService.updateEpisode(updateEpisodeArgs);

      expect(result).toEqual({ ok: false });
    });

    it('should update episode', async () => {
      jest.spyOn(podcastsService, 'getEpisode').mockResolvedValue({
        ok: true,
        episode: null,
      });

      const result = await podcastsService.updateEpisode(updateEpisodeArgs);

      expect(episodesRepository.save).toHaveBeenCalledTimes(1);
      expect(episodesRepository.save).toHaveBeenCalledWith({
        title: updateEpisodeArgs.title,
      });

      expect(result).toEqual({ ok: true });
    });

    it('should fail if error is occured', async () => {
      const result = await podcastsService.updateEpisode(updateEpisodeArgs);

      expect(result).toEqual(InternalServerErrorOutput);
    });
  });
});
