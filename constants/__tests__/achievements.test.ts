import { ACHIEVEMENTS, getAchievementById, getAchievementsByCategory } from '../achievements';
import { Achievement } from '../../types';

describe('achievements constants', () => {
  describe('ACHIEVEMENTS', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
      expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    });

    it('should have unique IDs for all achievements', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required properties for all achievements', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.id).toBeDefined();
        expect(typeof achievement.id).toBe('string');
        expect(achievement.id.length).toBeGreaterThan(0);

        expect(achievement.name).toBeDefined();
        expect(typeof achievement.name).toBe('string');
        expect(achievement.name.length).toBeGreaterThan(0);

        expect(achievement.description).toBeDefined();
        expect(typeof achievement.description).toBe('string');

        expect(achievement.icon).toBeDefined();
        expect(typeof achievement.icon).toBe('string');

        expect(achievement.category).toBeDefined();
        expect(['milestone', 'skill', 'special']).toContain(achievement.category);

        expect(achievement.requirement).toBeDefined();
        expect(achievement.requirement.type).toBeDefined();
        expect(achievement.requirement.value).toBeDefined();
        expect(typeof achievement.requirement.value).toBe('number');
      });
    });

    it('should have valid requirement types', () => {
      const validTypes = ['count', 'specific'];
      ACHIEVEMENTS.forEach((achievement) => {
        expect(validTypes).toContain(achievement.requirement.type);
      });
    });

    it('should have positive requirement values', () => {
      ACHIEVEMENTS.forEach((achievement) => {
        expect(achievement.requirement.value).toBeGreaterThan(0);
      });
    });

    it('should include milestone achievements', () => {
      const milestones = ACHIEVEMENTS.filter(a => a.category === 'milestone');
      expect(milestones.length).toBeGreaterThan(0);
    });

    it('should include special achievements', () => {
      const special = ACHIEVEMENTS.filter(a => a.category === 'special');
      expect(special.length).toBeGreaterThan(0);
    });

    it('should include skill achievements', () => {
      const skills = ACHIEVEMENTS.filter(a => a.category === 'skill');
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should have first_delivery achievement', () => {
      const firstDelivery = ACHIEVEMENTS.find(a => a.id === 'first_delivery');
      expect(firstDelivery).toBeDefined();
      expect(firstDelivery?.requirement.value).toBe(1);
    });

    it('should have ten_deliveries achievement', () => {
      const tenDeliveries = ACHIEVEMENTS.find(a => a.id === 'ten_deliveries');
      expect(tenDeliveries).toBeDefined();
      expect(tenDeliveries?.requirement.value).toBe(10);
    });
  });

  describe('getAchievementById', () => {
    it('should return achievement when found', () => {
      const achievement = getAchievementById('first_delivery');

      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('first_delivery');
      expect(achievement?.name).toBe('First Steps');
    });

    it('should return undefined for non-existent ID', () => {
      const achievement = getAchievementById('non_existent_achievement');
      expect(achievement).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const achievement = getAchievementById('');
      expect(achievement).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const achievement = getAchievementById('FIRST_DELIVERY');
      expect(achievement).toBeUndefined();
    });

    it('should return the correct achievement for each known ID', () => {
      const testCases = [
        { id: 'first_delivery', expectedName: 'First Steps' },
        { id: 'ten_deliveries', expectedName: 'Rising Star' },
        { id: 'fifty_deliveries', expectedName: 'Experienced Professional' },
        { id: 'hundred_deliveries', expectedName: 'Century Club' },
        { id: 'first_twins', expectedName: 'Double Blessing' },
        { id: 'holiday_hero', expectedName: 'Holiday Hero' },
        { id: 'weekend_warrior', expectedName: 'Weekend Warrior' },
      ];

      testCases.forEach(({ id, expectedName }) => {
        const achievement = getAchievementById(id);
        expect(achievement).toBeDefined();
        expect(achievement?.name).toBe(expectedName);
      });
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return all milestone achievements', () => {
      const milestones = getAchievementsByCategory('milestone');

      expect(Array.isArray(milestones)).toBe(true);
      expect(milestones.length).toBeGreaterThan(0);
      milestones.forEach((achievement) => {
        expect(achievement.category).toBe('milestone');
      });
    });

    it('should return all special achievements', () => {
      const special = getAchievementsByCategory('special');

      expect(Array.isArray(special)).toBe(true);
      expect(special.length).toBeGreaterThan(0);
      special.forEach((achievement) => {
        expect(achievement.category).toBe('special');
      });
    });

    it('should return all skill achievements', () => {
      const skills = getAchievementsByCategory('skill');

      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((achievement) => {
        expect(achievement.category).toBe('skill');
      });
    });

    it('should return empty array for invalid category', () => {
      // @ts-expect-error Testing invalid input
      const invalid = getAchievementsByCategory('invalid_category');
      expect(Array.isArray(invalid)).toBe(true);
      expect(invalid.length).toBe(0);
    });

    it('should include first_delivery in milestone category', () => {
      const milestones = getAchievementsByCategory('milestone');
      const firstDelivery = milestones.find(a => a.id === 'first_delivery');
      expect(firstDelivery).toBeDefined();
    });

    it('should include holiday_hero in special category', () => {
      const special = getAchievementsByCategory('special');
      const holidayHero = special.find(a => a.id === 'holiday_hero');
      expect(holidayHero).toBeDefined();
    });

    it('should include vaginal_expert in skill category', () => {
      const skills = getAchievementsByCategory('skill');
      const vaginalExpert = skills.find(a => a.id === 'vaginal_expert');
      expect(vaginalExpert).toBeDefined();
    });

    it('should return achievements that sum to total count', () => {
      const milestones = getAchievementsByCategory('milestone');
      const special = getAchievementsByCategory('special');
      const skills = getAchievementsByCategory('skill');

      const totalFromCategories = milestones.length + special.length + skills.length;
      expect(totalFromCategories).toBe(ACHIEVEMENTS.length);
    });
  });
});
