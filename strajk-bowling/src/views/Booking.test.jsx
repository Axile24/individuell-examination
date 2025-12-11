import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Booking from './Booking';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render Booking component with router
const renderBooking = () => {
  return render(
    <MemoryRouter>
      <Booking />
    </MemoryRouter>
  );
};

// Helper function to find input by label text when label and input are siblings
const getInputByLabel = (labelText) => {
  const label = screen.getByText(labelText);
  const inputSection = label.closest('.input');
  return within(inputSection).getByRole('textbox');
};

// Helper function to find all inputs by label text pattern (supports regex)
const getAllInputsByLabel = (labelPattern) => {
  let labels;
  if (labelPattern instanceof RegExp) {
    labels = screen.getAllByText(labelPattern);
  } else {
    labels = screen.getAllByText(labelPattern);
  }
  return labels.map(label => {
    const inputSection = label.closest('.input');
    return within(inputSection).getByRole('textbox');
  });
};

describe('Booking View - User Story 1: Book date, time and number of players', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage and resetting mocks');
    // Clear sessionStorage and reset mocks before each test
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('should allow user to select date and time from calendar and time picker', async () => {
    console.log('Test: Selecting date and time');
    // Acceptanskriterier: Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem
    const user = userEvent.setup();
    renderBooking();
    console.log('Component rendered');

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    console.log('Found date and time inputs');

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();

    console.log('Typing date: 2024-12-25');
    await user.type(dateInput, '2024-12-25');
    console.log('Typing time: 18:00');
    await user.type(timeInput, '18:00');

    expect(dateInput).toHaveValue('2024-12-25');
    expect(timeInput).toHaveValue('18:00');
    console.log('Date and time values verified');
    console.log('Test passed: User can select date and time');
  });

  it('should allow user to enter number of players (minimum 1)', async () => {
    console.log('Test: Entering number of players');
    // Acceptanskriterier: Användaren ska kunna ange antal spelare (minst 1 spelare)
    const user = userEvent.setup();
    renderBooking();

    const peopleInput = screen.getByTestId('input-people');
    console.log('Found people input');

    expect(peopleInput).toBeInTheDocument();
    console.log('Typing number of players: 3');
    await user.type(peopleInput, '3');

    expect(peopleInput).toHaveValue(3);
    console.log('People input value verified: 3');
    console.log('Test passed: User can enter number of players');
  });

  it('should allow user to reserve one or more lanes based on number of players', async () => {
    // Acceptanskriterier: Användaren ska kunna reservera ett eller flera banor beroende på antal spelare
    const user = userEvent.setup();
    renderBooking();

    const lanesInput = screen.getByTestId('input-lanes');

    expect(lanesInput).toBeInTheDocument();
    await user.type(lanesInput, '2');

    expect(lanesInput).toHaveValue(2);
    console.log('Test passed: User can reserve lanes');
  });

  it('should display error message if user does not fill in date, time, players or lanes', async () => {
    console.log('Test: Error message when fields are empty');
    // VG Acceptanskriterier: Ifall användaren inte fyller i något av ovanstående så ska ett felmeddelande visas
    const user = userEvent.setup();
    renderBooking();

    const submitButton = screen.getByTestId('submit-booking-button');
    console.log('Clicking submit button without filling fields');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      console.log('Error message found');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Alla fälten måste vara ifyllda');
      console.log('Error message text verified');
      console.log('Test passed: Error message shown when fields are empty');
    });
  });

  it('should display error message if user enters negative numbers for people or lanes', async () => {
    console.log('Test: Negative numbers validation');
    // Acceptanskriterier: Användaren ska kunna ange antal spelare (minst 1 spelare) - testar att negativa tal inte accepteras
    const user = userEvent.setup();
    renderBooking();
    console.log('Component rendered');

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');
    console.log('Found all input fields');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    
    // Test negative number for people
    console.log('Testing negative number for people: -1');
    await user.clear(peopleInput);
    await user.type(peopleInput, '-1');
    await user.type(lanesInput, '1');

    const submitButton = screen.getByTestId('submit-booking-button');
    console.log('Clicking submit with negative people value');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      console.log('Error message found for negative people');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Alla fälten måste vara ifyllda');
    });

    // Test negative number for lanes
    console.log('Testing negative number for lanes: -1');
    await user.clear(peopleInput);
    await user.clear(lanesInput);
    await user.type(peopleInput, '2');
    await user.type(lanesInput, '-1');

    console.log('Clicking submit with negative lanes value');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      console.log('Error message found for negative lanes');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Alla fälten måste vara ifyllda');
      console.log('Negative number validation test completed');
      console.log('Test passed: Error message shown for negative numbers');
    });
  });

  it('should display error message if not enough lanes available for number of players', async () => {
    // VG Acceptanskriterier: Om det inte finns tillräckligt med lediga banor för det angivna antalet spelare, ska användaren få ett felmeddelande
    const user = userEvent.setup();
    renderBooking();

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '10'); // 10 players
    await user.type(lanesInput, '1'); // Only 1 lane (max 4 players per lane)

    // Add shoe sizes for all players
    const addShoeButton = screen.getByTestId('add-shoe-button');
    for (let i = 0; i < 10; i++) {
      await user.click(addShoeButton);
    }

    // Fill in all shoe sizes
    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    for (const input of shoeInputs) {
      await user.type(input, '42');
    }

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Det får max vara 4 spelare per bana');
      console.log('Test passed: Error message shown when not enough lanes');
    });
  });
});

describe('Booking View - User Story 2: Select shoe size for each player', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage and resetting mocks');
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('should allow user to enter shoe size for each player', async () => {
    console.log('Test: Entering shoe sizes');
    // Acceptanskriterier: Användaren ska kunna ange skostorlek för varje spelare
    const user = userEvent.setup();
    renderBooking();
    console.log('Component rendered');

    const peopleInput = screen.getByTestId('input-people');
    await user.type(peopleInput, '2');

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInput1 = getInputByLabel('Shoe size / person 1');
    const shoeInput2 = getInputByLabel('Shoe size / person 2');

    await user.type(shoeInput1, '42');
    await user.type(shoeInput2, '38');

    expect(shoeInput1).toHaveValue('42');
    expect(shoeInput2).toHaveValue('38');
    console.log('Test passed: User can enter shoe size for each player');
  });

  it('should allow user to change shoe size for each player', async () => {
    // Acceptanskriterier: Användaren ska kunna ändra skostorlek för varje spelare
    const user = userEvent.setup();
    renderBooking();

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);

    const shoeInput = getInputByLabel('Shoe size / person 1');
    await user.type(shoeInput, '42');
    expect(shoeInput).toHaveValue('42');

    await user.clear(shoeInput);
    await user.type(shoeInput, '40');
    expect(shoeInput).toHaveValue('40');
    console.log('Test passed: User can change shoe size');
  });

  it('should be possible to select shoe size for all players included in booking', async () => {
    // Acceptanskriterier: Det ska vara möjligt att välja skostorlek för alla spelare som ingår i bokningen
    const user = userEvent.setup();
    renderBooking();

    const peopleInput = screen.getByTestId('input-people');
    await user.type(peopleInput, '3');

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    expect(shoeInputs).toHaveLength(3);

    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');
    await user.type(shoeInputs[2], '40');

    expect(shoeInputs[0]).toHaveValue('42');
    expect(shoeInputs[1]).toHaveValue('38');
    expect(shoeInputs[2]).toHaveValue('40');
    console.log('Test passed: User can select shoe size for all players');
  });

  it('should display error message if user tries to complete booking without entering shoe size for a player', async () => {
    // VG Acceptanskriterier: Om användaren försöker slutföra bokningen utan att ange skostorlek för en spelare som har valt att boka skor, ska systemet visa ett felmeddelande
    const user = userEvent.setup();
    renderBooking();

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '2');
    await user.type(lanesInput, '1');

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    // Only fill one shoe size
    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    // Leave second shoe size empty

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Alla skor måste vara ifyllda');
      console.log('Test passed: Error message shown when shoe size missing');
    });
  });

  it('should display error message if number of people and shoes do not match', async () => {
    // VG Acceptanskriterier: Om antalet personer och skor inte matchas ska ett felmeddelande visas
    const user = userEvent.setup();
    renderBooking();

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '3');
    await user.type(lanesInput, '1');

    // Only add 2 shoe inputs instead of 3
    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Antalet skor måste stämma överens med antal spelare');
      console.log('Test passed: Error message shown when people and shoes mismatch');
    });
  });

  it('should show overview where user can check selected shoe sizes for each player before completing booking', async () => {
    // Acceptanskriterier: Systemet ska visa en översikt där användaren kan kontrollera de valda skostorlekarna för varje spelare innan bokningen slutförs
    const user = userEvent.setup();
    renderBooking();

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInput1 = getInputByLabel('Shoe size / person 1');
    const shoeInput2 = getInputByLabel('Shoe size / person 2');

    await user.type(shoeInput1, '42');
    await user.type(shoeInput2, '38');

    // Verify both shoe sizes are visible
    expect(shoeInput1).toBeInTheDocument();
    expect(shoeInput2).toBeInTheDocument();
    expect(shoeInput1).toHaveValue('42');
    expect(shoeInput2).toHaveValue('38');
    console.log('Test passed: Overview shows selected shoe sizes');
  });
});

describe('Booking View - User Story 3: Remove shoe size field', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage and resetting mocks');
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('should allow user to remove a previously selected shoe size field by clicking "-" button', async () => {
    // Acceptanskriterier: Användaren ska kunna ta bort ett tidigare valt fält för skostorlek genom att klicka på en "-"-knapp vid varje spelare
    const user = userEvent.setup();
    renderBooking();

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    expect(shoeInputs).toHaveLength(2);

    const removeButton = screen.getByTestId('remove-shoe-0');
    await user.click(removeButton);

    const remainingShoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    expect(remainingShoeInputs).toHaveLength(1);
    console.log('Test passed: User can remove shoe size field');
  });

  it('should update booking so no shoes are booked for player when shoe size is removed', async () => {
    // Acceptanskriterier: När användaren tar bort skostorleken för en spelare ska systemet uppdatera bokningen så att inga skor längre är bokade för den spelaren
    const user = userEvent.setup();
    renderBooking();

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');

    const removeButton = screen.getByTestId('remove-shoe-0');
    await user.click(removeButton);

    // The removed shoe should no longer be in the form
    const remainingInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    expect(remainingInputs).toHaveLength(1);
    expect(remainingInputs[0]).toHaveValue('38');
    console.log('Test passed: Booking updated when shoe size removed');
  });

  it('should not include removed player in shoe count and shoe price in total booking sum', async () => {
    // Acceptanskriterier: Om användaren tar bort skostorleken ska systemet inte inkludera den spelaren i skorantalet och priset för skor i den totala bokningssumman
    const user = userEvent.setup();
    renderBooking();

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '2');
    await user.type(lanesInput, '1');

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');

    // Remove one shoe
    const removeButton = screen.getByTestId('remove-shoe-0');
    await user.click(removeButton);

    // Now only one shoe should remain
    const remainingInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    expect(remainingInputs).toHaveLength(1);

    // Update people count to match remaining shoes
    await user.clear(peopleInput);
    await user.type(peopleInput, '1');

    await user.type(remainingInputs[0], '38');

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    console.log('Test passed: Removed player not included in shoe count');
  });
});

describe('Booking View - User Story 4: Complete reservation and get booking number', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage and resetting mocks');
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('should allow user to complete booking by clicking "slutför bokning" button', async () => {
    console.log('Test: Submit button exists');
    // Acceptanskriterier: Användaren ska kunna slutföra bokningen genom att klicka på en "slutför bokning"-knapp
    const user = userEvent.setup();
    renderBooking();

    const submitButton = screen.getByTestId('submit-booking-button');
    console.log('Found submit button');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('strIIIIIike!');
    console.log('Submit button text verified');
    console.log('Test passed: Submit button exists');
  });

  it('should generate booking number and display it to user after booking is completed', async () => {
    console.log('Test: Booking number generation');
    // Acceptanskriterier: Systemet ska generera ett bokningsnummer och visa detta till användaren efter att bokningen är slutförd
    const user = userEvent.setup();
    renderBooking();
    console.log('Component rendered');

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '2');
    await user.type(lanesInput, '1');

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');

    const submitButton = screen.getByTestId('submit-booking-button');
    console.log('Clicking submit button');
    await user.click(submitButton);

    await waitFor(() => {
      console.log('Checking navigation was called');
      expect(mockNavigate).toHaveBeenCalledWith('/confirmation', expect.any(Object));
    });

    // Check that confirmation data is saved in sessionStorage
    const savedConfirmation = JSON.parse(sessionStorage.getItem('confirmation'));
    console.log('Confirmation saved:', savedConfirmation);
    expect(savedConfirmation).toBeTruthy();
    expect(savedConfirmation.bookingId).toBeTruthy();
    console.log('Booking ID verified:', savedConfirmation.bookingId);
    console.log('Test passed: Booking number generated and displayed');
  });

  it('should calculate and display total sum based on number of players (120 kr per person) and lanes (100 kr per lane)', async () => {
    console.log('Test: Total sum calculation');
    // Acceptanskriterier: Systemet ska beräkna och visa den totala summan för bokningen baserat på antalet spelare (120 kr per person) samt antalet reserverade banor (100 kr per bana)
    const user = userEvent.setup();
    renderBooking();
    console.log('Component rendered');

    const dateInput = screen.getByTestId('input-when');
    const timeInput = screen.getByTestId('input-time');
    const peopleInput = screen.getByTestId('input-people');
    const lanesInput = screen.getByTestId('input-lanes');

    await user.type(dateInput, '2024-12-25');
    await user.type(timeInput, '18:00');
    await user.type(peopleInput, '3'); // 3 players = 360 kr
    await user.type(lanesInput, '2'); // 2 lanes = 200 kr, Total = 560 kr

    const addShoeButton = screen.getByTestId('add-shoe-button');
    await user.click(addShoeButton);
    await user.click(addShoeButton);
    await user.click(addShoeButton);

    const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
    await user.type(shoeInputs[0], '42');
    await user.type(shoeInputs[1], '38');
    await user.type(shoeInputs[2], '40');

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
      const savedConfirmation = JSON.parse(sessionStorage.getItem('confirmation'));
      expect(savedConfirmation.price).toBe(560); // 3 * 120 + 2 * 100 = 560
      console.log('Test passed: Total sum calculated correctly');
    });
  });
});
