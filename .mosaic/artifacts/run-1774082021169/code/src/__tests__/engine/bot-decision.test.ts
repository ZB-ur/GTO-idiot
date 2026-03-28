import { describe, it, expect } from 'vitest';
import {
  getAllBotProfiles,
  getBotProfileById,
  getBotProfilesByStyle,
  getStyleParams,
  getDefaultBotLineup,
} from '../../engine/bot/profiles';
import { selectBetSize, shouldShove } from '../../engine/bot/sizing';

describe('Bot Profiles', () => {
  describe('getAllBotProfiles', () => {
    it('should return 5 bot profiles', () => {
      const profiles = getAllBotProfiles();
      expect(profiles).toHaveLength(5);
    });

    it('should have unique IDs', () => {
      const profiles = getAllBotProfiles();
      const ids = new Set(profiles.map(p => p.id));
      expect(ids.size).toBe(5);
    });

    it('should cover all 5 styles', () => {
      const profiles = getAllBotProfiles();
      const styles = new Set(profiles.map(p => p.style));
      expect(styles).toContain('TAG');
      expect(styles).toContain('LAG');
      expect(styles).toContain('NIT');
      expect(styles).toContain('Fish');
      expect(styles).toContain('Maniac');
    });

    it('should have required fields', () => {
      const profiles = getAllBotProfiles();
      for (const profile of profiles) {
        expect(profile.id).toBeTruthy();
        expect(profile.name).toBeTruthy();
        expect(profile.style).toBeTruthy();
        expect(profile.description).toBeTruthy();
      }
    });
  });

  describe('getBotProfileById', () => {
    it('should find a profile by ID', () => {
      const profile = getBotProfileById('bot-tag-1');
      expect(profile).toBeDefined();
      expect(profile!.style).toBe('TAG');
    });

    it('should return undefined for unknown ID', () => {
      const profile = getBotProfileById('nonexistent');
      expect(profile).toBeUndefined();
    });
  });

  describe('getBotProfilesByStyle', () => {
    it('should find profiles by style', () => {
      const profiles = getBotProfilesByStyle('TAG');
      expect(profiles.length).toBeGreaterThanOrEqual(1);
      expect(profiles.every(p => p.style === 'TAG')).toBe(true);
    });
  });

  describe('getStyleParams', () => {
    it('should return extended params for TAG', () => {
      const params = getStyleParams('TAG');
      expect(params.vpip).toBe(22);
      expect(params.pfr).toBe(18);
      expect(params.aggression).toBeGreaterThan(0);
      expect(params.cbetFrequency).toBeGreaterThan(0);
    });

    it('should have higher aggression for Maniac than NIT', () => {
      const maniac = getStyleParams('Maniac');
      const nit = getStyleParams('NIT');
      expect(maniac.aggression).toBeGreaterThan(nit.aggression);
    });

    it('should have wider VPIP for Fish than TAG', () => {
      const fish = getStyleParams('Fish');
      const tag = getStyleParams('TAG');
      expect(fish.vpip).toBeGreaterThan(tag.vpip);
    });
  });

  describe('getDefaultBotLineup', () => {
    it('should return 5 bots for 6-max table', () => {
      const lineup = getDefaultBotLineup();
      expect(lineup).toHaveLength(5);
    });
  });
});

describe('Bot Sizing', () => {
  describe('selectBetSize', () => {
    it('should return a bet amount within range', () => {
      const sizing = selectBetSize('TAG', 'preflop', 1.5, 2, 100);
      expect(sizing.amount).toBeGreaterThanOrEqual(2);
      expect(sizing.amount).toBeLessThanOrEqual(100);
    });

    it('should return all-in when maxRaise equals minRaise', () => {
      const sizing = selectBetSize('TAG', 'flop', 10, 10, 10);
      expect(sizing.amount).toBe(10);
    });

    it('should return values for different styles', () => {
      const tagSize = selectBetSize('TAG', 'flop', 10, 3, 100);
      const maniacSize = selectBetSize('Maniac', 'flop', 10, 3, 100);

      expect(tagSize.amount).toBeGreaterThanOrEqual(3);
      expect(maniacSize.amount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('shouldShove', () => {
    it('should return true when stack is very small relative to pot', () => {
      // Small stack, big pot — should shove
      const result = shouldShove('TAG', 3, 20, 'flop');
      expect(result).toBe(true);
    });

    it('should return false when stack is large relative to pot', () => {
      const result = shouldShove('TAG', 100, 5, 'flop');
      expect(result).toBe(false);
    });
  });
});
