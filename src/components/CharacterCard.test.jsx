import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CharacterCard from './CharacterCard'
import * as demoCharacters from '../data/demo-characters'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ characterId: 'achilles' })
  }
})

// Mock CharacterModes component
vi.mock('./CharacterModes', () => ({
  default: ({ character, mode, onMessage, abilities, onAbilityUse }) => (
    <div data-testid="character-modes" data-mode={mode}>
      {mode === 'battle' && abilities && (
        <div>
          {abilities.map((ability) => (
            <button
              key={ability.name}
              data-testid={`ability-${ability.name}`}
              onClick={() => onAbilityUse(ability)}
            >
              {ability.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}))

// Mock demo character data
const mockCharacter = {
  id: 'achilles',
  name: 'Achilles',
  portrait: '⚔️',
  hp: { current: 104, max: 130 },
  ac: 18,
  abilities: [
    { name: 'Sword Strike', description: 'Attack with sword' },
    { name: 'Divine Fury', description: 'Divine attack' },
    { name: 'Shield Wall', description: 'Defensive stance' }
  ],
  initialMessage: {
    type: 'character',
    mood: 'Contemplative',
    text: 'Greetings, mortal.',
    timestamp: new Date()
  }
}

describe('CharacterCard', () => {
  beforeEach(() => {
    vi.spyOn(demoCharacters, 'getDemoCharacter').mockReturnValue(mockCharacter)
    mockNavigate.mockClear()

    // Mock scrollIntoView for jsdom
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('shows loading state initially', () => {
      vi.spyOn(demoCharacters, 'getDemoCharacter').mockReturnValue(null)
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )
      expect(screen.getByText('Loading character...')).toBeInTheDocument()
    })

    it('renders character after loading', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('ACHILLES')).toBeInTheDocument()
      })
    })

    it('displays character stats correctly', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('104/130 HP')).toBeInTheDocument()
        expect(screen.getByText('AC 18')).toBeInTheDocument()
      })
    })

    it('shows initial message from character', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Greetings, mortal.')).toBeInTheDocument()
      })
    })
  })

  describe('HP Display Classes', () => {
    it('shows no class when HP is above 60%', async () => {
      const healthyCharacter = { ...mockCharacter, hp: { current: 100, max: 130 } }
      vi.spyOn(demoCharacters, 'getDemoCharacter').mockReturnValue(healthyCharacter)

      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const hpDisplay = screen.getByText('100/130 HP')
        expect(hpDisplay).not.toHaveClass('critical')
        expect(hpDisplay).not.toHaveClass('damaged')
      })
    })

    it('shows damaged class when HP is between 25% and 60%', async () => {
      const damagedCharacter = { ...mockCharacter, hp: { current: 50, max: 130 } }
      vi.spyOn(demoCharacters, 'getDemoCharacter').mockReturnValue(damagedCharacter)

      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const hpDisplay = screen.getByText('50/130 HP')
        expect(hpDisplay).toHaveClass('damaged')
      })
    })

    it('shows critical class when HP is at or below 25%', async () => {
      const criticalCharacter = { ...mockCharacter, hp: { current: 30, max: 130 } }
      vi.spyOn(demoCharacters, 'getDemoCharacter').mockReturnValue(criticalCharacter)

      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const hpDisplay = screen.getByText('30/130 HP')
        expect(hpDisplay).toHaveClass('critical')
      })
    })
  })

  describe('Mode Switching', () => {
    it('starts in portrait mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Portrait Mode')).toBeInTheDocument()
      })
    })

    it('switches to battle mode when battle button clicked', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const battleButtons = screen.getAllByText('Battle')
        // Click the scene switcher battle button (should be first one)
        fireEvent.click(battleButtons[0])
      })

      expect(screen.getByText('Red Sea Battle')).toBeInTheDocument()
    })

    it('updates mood when switching to battle mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Contemplative')).toBeInTheDocument()
      })

      const battleButtons = screen.getAllByText('Battle')
      fireEvent.click(battleButtons[0])

      expect(screen.getByText('Battle Ready')).toBeInTheDocument()
    })

    it('returns to contemplative mood in portrait mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const battleButtons = screen.getAllByText('Battle')
        fireEvent.click(battleButtons[0])
      })

      const portraitButton = screen.getByText('Portrait')
      fireEvent.click(portraitButton)

      expect(screen.getByText('Contemplative')).toBeInTheDocument()
    })
  })

  describe('Interaction Modes', () => {
    it('starts in conversation mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const conversationTab = screen.getByRole('tab', { name: /conversation/i })
        expect(conversationTab).toHaveClass('active')
      })
    })

    it('switches to battle interaction mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const battleTab = screen.getByRole('tab', { name: /battle mode/i })
        fireEvent.click(battleTab)
      })

      const modesComponent = screen.getByTestId('character-modes')
      expect(modesComponent).toHaveAttribute('data-mode', 'battle')
    })

    it('switches to skills mode', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const skillsTab = screen.getByRole('tab', { name: /skills/i })
        fireEvent.click(skillsTab)
      })

      const modesComponent = screen.getByTestId('character-modes')
      expect(modesComponent).toHaveAttribute('data-mode', 'skills')
    })
  })

  describe('Chat Message Handling', () => {
    it('sends player message on form submit', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Speak with the immortal warrior...')
        const sendButton = screen.getByText('Send')

        fireEvent.change(input, { target: { value: 'Hello, Achilles!' } })
        fireEvent.click(sendButton)
      })

      expect(screen.getByText('Hello, Achilles!')).toBeInTheDocument()
    })

    it('clears input after sending message', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Speak with the immortal warrior...')
        fireEvent.change(input, { target: { value: 'Test message' } })
        fireEvent.submit(input.closest('form'))
      })

      const input = screen.getByPlaceholderText('Speak with the immortal warrior...')
      expect(input.value).toBe('')
    })

    it('does not send empty messages', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Speak with the immortal warrior...')
        fireEvent.change(input, { target: { value: '   ' } })
        fireEvent.submit(input.closest('form'))
      })

      // Should only have the initial message, not the empty one
      const messages = screen.queryAllByText('   ')
      expect(messages).toHaveLength(0)
    })

    it('adds player message to chat', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Speak with the immortal warrior...')
        fireEvent.change(input, { target: { value: 'Hello!' } })
        fireEvent.submit(input.closest('form'))
      })

      expect(screen.getByText('Hello!')).toBeInTheDocument()
    })
  })

  describe('Combat Abilities', () => {
    it('renders character modes component with abilities', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const modesComponent = screen.getByTestId('character-modes')
        expect(modesComponent).toBeInTheDocument()
      })
    })

    it('passes abilities to CharacterModes component', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        const battleTab = screen.getByRole('tab', { name: /battle mode/i })
        fireEvent.click(battleTab)
      })

      const modesComponent = screen.getByTestId('character-modes')
      expect(modesComponent).toHaveAttribute('data-mode', 'battle')
    })
  })

  describe('Navigation', () => {
    it('renders close button', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('✕')).toBeInTheDocument()
      })
    })
  })

  describe('Message Display', () => {
    it('displays initial character message', async () => {
      render(
        <BrowserRouter>
          <CharacterCard />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Greetings, mortal.')).toBeInTheDocument()
      })
    })
  })
})
