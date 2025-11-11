import { describe, it, expect, vi } from 'vitest'
import { rollDie, rollDamage, rollD20, rollAttack, formatRollResult, getNarration } from './dice'

describe('Dice Rolling Utilities', () => {
  describe('rollDie', () => {
    it('returns a number between 1 and the number of sides', () => {
      const result = rollDie(20)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(20)
    })

    it('works with different die sizes', () => {
      const d6 = rollDie(6)
      expect(d6).toBeGreaterThanOrEqual(1)
      expect(d6).toBeLessThanOrEqual(6)
    })
  })

  describe('rollDamage', () => {
    it('returns an object with total, rolls, and formula', () => {
      const result = rollDamage(2, 6, 3)
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('rolls')
      expect(result).toHaveProperty('formula')
      expect(result.rolls).toHaveLength(2)
    })

    it('calculates total correctly', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // Always roll max
      const result = rollDamage(2, 6, 3)
      expect(result.total).toBe(15) // 6 + 6 + 3
      vi.restoreAllMocks()
    })

    it('formats formula correctly', () => {
      const result = rollDamage(2, 6, 3)
      expect(result.formula).toBe('2d6+3')
    })

    it('handles zero bonus', () => {
      const result = rollDamage(1, 8, 0)
      expect(result.formula).toBe('1d8')
    })
  })

  describe('rollD20', () => {
    it('detects critical hits', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // Roll 20
      const result = rollD20(5)
      expect(result.d20).toBe(20)
      expect(result.isCrit).toBe(true)
      expect(result.isFail).toBe(false)
      vi.restoreAllMocks()
    })

    it('detects critical failures', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0) // Roll 1
      const result = rollD20(5)
      expect(result.d20).toBe(1)
      expect(result.isCrit).toBe(false)
      expect(result.isFail).toBe(true)
      vi.restoreAllMocks()
    })

    it('adds modifier correctly', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Roll 11
      const result = rollD20(5)
      expect(result.total).toBe(16) // 11 + 5
      vi.restoreAllMocks()
    })
  })

  describe('rollAttack', () => {
    it('returns attack and damage results', () => {
      const result = rollAttack({
        modifier: 5,
        damageCount: 1,
        damageSides: 8,
        damageBonus: 3
      })
      expect(result).toHaveProperty('attack')
      expect(result).toHaveProperty('damage')
    })

    it('doubles damage dice on critical hit', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // Roll 20
      const result = rollAttack({
        modifier: 5,
        damageCount: 2,
        damageSides: 6,
        damageBonus: 3
      })
      expect(result.attack.isCrit).toBe(true)
      expect(result.damage.rolls).toHaveLength(4) // Doubled from 2 to 4
      vi.restoreAllMocks()
    })

    it('returns null damage on critical fail', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0) // Roll 1
      const result = rollAttack({
        modifier: 5,
        damageCount: 1,
        damageSides: 8,
        damageBonus: 3
      })
      expect(result.attack.isFail).toBe(true)
      expect(result.damage).toBeNull()
      vi.restoreAllMocks()
    })
  })

  describe('formatRollResult', () => {
    it('formats attack roll with damage', () => {
      const result = {
        attack: { total: 15, d20: 12, modifier: 3, isCrit: false, isFail: false },
        damage: { total: 10, formula: '2d6+2', rolls: [4, 4] }
      }
      const formatted = formatRollResult(result)
      expect(formatted).toContain('Attack: 15')
      expect(formatted).toContain('Damage: 10')
      expect(formatted).toContain('2d6+2')
    })

    it('includes critical hit text', () => {
      const result = {
        attack: { total: 25, d20: 20, modifier: 5, isCrit: true, isFail: false },
        damage: { total: 20, formula: '4d6+4', rolls: [6, 6, 4, 4] }
      }
      const formatted = formatRollResult(result)
      expect(formatted).toContain('CRITICAL HIT')
    })
  })

  describe('getNarration', () => {
    it('returns crit narration for critical hits', () => {
      const result = { attack: { total: 25, isCrit: true, isFail: false } }
      const narration = getNarration('Sword Strike', result)
      expect(narration).toContain('legendary precision')
    })

    it('returns fail narration for critical fails', () => {
      const result = { attack: { total: 1, isCrit: false, isFail: true } }
      const narration = getNarration('Sword Strike', result)
      expect(narration).toContain('misstep')
    })

    it('returns default narration for unknown abilities', () => {
      const result = { attack: { total: 15, isCrit: false, isFail: false } }
      const narration = getNarration('Unknown Ability', result)
      expect(narration).toBeTruthy()
    })
  })
})
