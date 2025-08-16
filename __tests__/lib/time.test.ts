import { formatDate, formatTime, isInNext24Hours } from '@/lib/time'

describe('Time Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(testDate)
      
      // Should format as "Jan 15, 2024" or similar
      expect(formatted).toMatch(/Jan 15, 2024|15 Jan 2024|2024-01-15/)
    })

    it('handles different date formats', () => {
      const dates = [
        new Date('2024-12-25T00:00:00Z'),
        new Date('2024-06-01T12:00:00Z'),
        new Date('2024-03-08T18:30:00Z'),
      ]
      
      dates.forEach(date => {
        const formatted = formatDate(date)
        expect(formatted).toBeTruthy()
        expect(typeof formatted).toBe('string')
      })
    })
  })

  describe('formatTime', () => {
    it('formats time correctly', () => {
      const testDate = new Date('2024-01-15T14:30:00Z')
      const formatted = formatTime(testDate)
      
      // Should format as "9:30 AM" or similar
      expect(formatted).toMatch(/(9:30|14:30|9:30 AM|2:30 PM)/)
    })

    it('handles different time formats', () => {
      const times = [
        new Date('2024-01-15T00:00:00Z'), // Midnight
        new Date('2024-01-15T12:00:00Z'), // Noon
        new Date('2024-01-15T23:59:00Z'), // Late night
      ]
      
      times.forEach(time => {
        const formatted = formatTime(time)
        expect(formatted).toBeTruthy()
        expect(typeof formatted).toBe('string')
      })
    })
  })

  describe('isInNext24Hours', () => {
    it('returns true for dates within next 24 hours', () => {
      const now = new Date()
      const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
      const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000)
      
      expect(isInNext24Hours(in12Hours)).toBe(true)
      expect(isInNext24Hours(in23Hours)).toBe(true)
    })

    it('returns false for dates beyond 24 hours', () => {
      const now = new Date()
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000)
      const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      
      expect(isInNext24Hours(in25Hours)).toBe(false)
      expect(isInNext24Hours(in2Days)).toBe(false)
    })

    it('returns false for past dates', () => {
      const now = new Date()
      const inPast = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
      
      expect(isInNext24Hours(inPast)).toBe(false)
    })

    it('handles edge case of exactly 24 hours', () => {
      const now = new Date()
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      // This should return false as it's exactly 24 hours (not within)
      expect(isInNext24Hours(in24Hours)).toBe(false)
    })
  })
})
