import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CharacterCreation from './CharacterCreation'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock fetch
global.fetch = vi.fn()

describe('CharacterCreation', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    global.fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Main Component', () => {
    it('renders the creation header', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      expect(screen.getByText('Create Your Character')).toBeInTheDocument()
    })

    it('shows back button', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      expect(screen.getByText('← Back')).toBeInTheDocument()
    })

    it('navigates home when back button clicked', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      const backButton = screen.getByText('← Back')
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('CreationChoice', () => {
    it('shows both creation options initially', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      expect(screen.getByText('Describe')).toBeInTheDocument()
      expect(screen.getByText('Quick Pick')).toBeInTheDocument()
    })

    it('shows description for prompt option', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      expect(screen.getByText('Type freely, just like Discord')).toBeInTheDocument()
    })

    it('shows description for quick option', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      expect(screen.getByText('Answer simple questions')).toBeInTheDocument()
    })

    it('switches to prompt creator when describe clicked', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      const describeButton = screen.getByText('Describe')
      fireEvent.click(describeButton)

      expect(screen.getByText('Describe Your Character')).toBeInTheDocument()
    })

    it('switches to quick creator when quick pick clicked', () => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )

      const quickButton = screen.getByText('Quick Pick')
      fireEvent.click(quickButton)

      expect(screen.getByText('Quick Character Creator')).toBeInTheDocument()
    })
  })

  describe('PromptCreator', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )
      const describeButton = screen.getByText('Describe')
      fireEvent.click(describeButton)
    })

    it('renders the prompt creator form', () => {
      expect(screen.getByText('Describe Your Character')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/A Drow paladin/)).toBeInTheDocument()
    })

    it('shows character count', () => {
      expect(screen.getByText('0/500')).toBeInTheDocument()
    })

    it('updates character count when typing', () => {
      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      expect(screen.getByText('15/500')).toBeInTheDocument()
    })

    it('shows example prompts', () => {
      expect(screen.getByText(/level 10 elf wizard/)).toBeInTheDocument()
      expect(screen.getByText(/Gruff dwarf fighter/)).toBeInTheDocument()
    })

    it('populates textarea when example clicked', () => {
      const exampleButton = screen.getByText(/level 10 elf wizard/)
      fireEvent.click(exampleButton)

      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      expect(textarea.value).toContain('level 10 elf wizard')
    })

    it('disables generate button when prompt is empty', () => {
      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('enables generate button when prompt has text', () => {
      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).not.toBeDisabled()
    })

    it('disables generate button when prompt is only whitespace', () => {
      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: '   ' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('limits prompt to 500 characters', () => {
      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      expect(textarea).toHaveAttribute('maxLength', '500')
    })

    it('calls API with correct data on generate', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          character: { id: '123', name: 'Test' },
          imageUrl: 'http://example.com/image.png'
        })
      })

      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://app.characterfoundry.io/api/characters/create',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'prompt',
              prompt: 'A brave warrior'
            })
          })
        )
      })
    })

    it('shows loading state during generation', async () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument()
      })
    })

    it('shows error message on API failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'))

      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to generate character. Please try again.')).toBeInTheDocument()
      })
    })

    it('navigates to preview on successful generation', async () => {
      const mockCharacter = { id: '123', name: 'Test Character' }
      const mockImageUrl = 'http://example.com/image.png'

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          character: mockCharacter,
          imageUrl: mockImageUrl
        })
      })

      const textarea = screen.getByPlaceholderText(/A Drow paladin/)
      fireEvent.change(textarea, { target: { value: 'A brave warrior' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/character-preview', {
          state: {
            character: mockCharacter,
            imageUrl: mockImageUrl
          }
        })
      })
    })

    it('allows going back to choice screen', () => {
      const backLink = screen.getByText('← Choose different method')
      fireEvent.click(backLink)

      expect(screen.getByText('Describe')).toBeInTheDocument()
      expect(screen.getByText('Quick Pick')).toBeInTheDocument()
    })
  })

  describe('QuickCreator', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <CharacterCreation />
        </BrowserRouter>
      )
      const quickButton = screen.getByText('Quick Pick')
      fireEvent.click(quickButton)
    })

    it('renders the quick creator form', () => {
      expect(screen.getByText('Quick Character Creator')).toBeInTheDocument()
    })

    it('shows all form fields', () => {
      expect(screen.getByLabelText('Character Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Race')).toBeInTheDocument()
      expect(screen.getByLabelText('Class')).toBeInTheDocument()
      expect(screen.getByLabelText(/Level:/)).toBeInTheDocument()
    })

    it('has name input with placeholder', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      expect(nameInput).toBeInTheDocument()
    })

    it('limits name to 50 characters', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      expect(nameInput).toHaveAttribute('maxLength', '50')
    })

    it('shows all race options', () => {
      const raceSelect = screen.getByLabelText('Race')
      expect(raceSelect.querySelectorAll('option').length).toBe(11) // 10 races + placeholder
    })

    it('shows all class options', () => {
      const classSelect = screen.getByLabelText('Class')
      expect(classSelect.querySelectorAll('option').length).toBe(13) // 12 classes + placeholder
    })

    it('includes specific races', () => {
      expect(screen.getByText('Dark Elf')).toBeInTheDocument()
      expect(screen.getByText('Dragonborn')).toBeInTheDocument()
      expect(screen.getByText('Tiefling')).toBeInTheDocument()
    })

    it('includes specific classes', () => {
      expect(screen.getByText('Paladin')).toBeInTheDocument()
      expect(screen.getByText('Wizard')).toBeInTheDocument()
      expect(screen.getByText('Barbarian')).toBeInTheDocument()
    })

    it('starts with level 1', () => {
      const levelSlider = screen.getByLabelText(/Level:/)
      expect(levelSlider.value).toBe('1')
    })

    it('updates level display when slider moved', () => {
      const levelSlider = screen.getByLabelText(/Level:/)
      fireEvent.change(levelSlider, { target: { value: '10' } })

      expect(screen.getByText('Level:')).toBeInTheDocument()
      expect(levelSlider.value).toBe('10')
    })

    it('level slider has correct range', () => {
      const levelSlider = screen.getByLabelText(/Level:/)
      expect(levelSlider).toHaveAttribute('min', '1')
      expect(levelSlider).toHaveAttribute('max', '20')
    })

    it('disables generate button when form is incomplete', () => {
      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('enables generate button when all required fields filled', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).not.toBeDisabled()
    })

    it('disables generate button when name is missing', () => {
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('disables generate button when race is missing', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('disables generate button when class is missing', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).toBeDisabled()
    })

    it('calls API with correct data on generate', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          character: { id: '123', name: 'Thorin' },
          imageUrl: 'http://example.com/image.png'
        })
      })

      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')
      const levelSlider = screen.getByLabelText(/Level:/)

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })
      fireEvent.change(levelSlider, { target: { value: '5' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://app.characterfoundry.io/api/characters/create',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'quick',
              name: 'Thorin',
              race: 'Dwarf',
              class: 'Fighter',
              level: 5
            })
          })
        )
      })
    })

    it('shows loading state during generation', async () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {}))

      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Generating...')).toBeInTheDocument()
      })
    })

    it('shows error message on API failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'))

      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to generate character. Please try again.')).toBeInTheDocument()
      })
    })

    it('navigates to preview on successful generation', async () => {
      const mockCharacter = { id: '123', name: 'Thorin' }
      const mockImageUrl = 'http://example.com/image.png'

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          character: mockCharacter,
          imageUrl: mockImageUrl
        })
      })

      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: 'Thorin' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      fireEvent.click(generateButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/character-preview', {
          state: {
            character: mockCharacter,
            imageUrl: mockImageUrl
          }
        })
      })
    })

    it('allows going back to choice screen', () => {
      const backLink = screen.getByText('← Choose different method')
      fireEvent.click(backLink)

      expect(screen.getByText('Describe')).toBeInTheDocument()
      expect(screen.getByText('Quick Pick')).toBeInTheDocument()
    })

    it('trims whitespace from name', () => {
      const nameInput = screen.getByPlaceholderText('Sebastienne')
      const raceSelect = screen.getByLabelText('Race')
      const classSelect = screen.getByLabelText('Class')

      fireEvent.change(nameInput, { target: { value: '  Thorin  ' } })
      fireEvent.change(raceSelect, { target: { value: 'Dwarf' } })
      fireEvent.change(classSelect, { target: { value: 'Fighter' } })

      const generateButton = screen.getByText('🎨 Generate Character')
      expect(generateButton).not.toBeDisabled()
    })
  })
})
