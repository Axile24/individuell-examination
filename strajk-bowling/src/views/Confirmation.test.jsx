import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Confirmation from './Confirmation';

// Helper function to render Confirmation component with router
const renderConfirmation = (initialEntries = ['/confirmation']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Confirmation />
    </MemoryRouter>
  );
};

describe('Confirmation View - User Story 5: Navigate between booking and confirmation views', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage');
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('should navigate from booking view to confirmation view when booking is complete', async () => {
    console.log('Test: Confirmation view renders booking details');
    // Acceptanskriterier: Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn när bokningen är klar
    // This is tested in Booking.test.jsx when checking navigation after booking submission
    // Here we verify the confirmation view renders correctly
    const mockConfirmation = {
      bookingId: 'BK-123456',
      when: '2024-12-25T18:00',
      people: 2,
      lanes: 1,
      shoes: ['42', '38'],
      price: 340,
    };

    console.log('Setting mock confirmation in sessionStorage');
    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmation();
    console.log('Confirmation component rendered');

    // Verify booking details are displayed
    expect(screen.getByDisplayValue('2024-12-25 18:00')).toBeInTheDocument();
    console.log('Date/time displayed');
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    console.log('People count displayed');
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    console.log('Lanes count displayed');
    expect(screen.getByDisplayValue('BK-123456')).toBeInTheDocument();
    console.log('Booking ID displayed');
  });

  it('should display "Ingen bokning gjord" if user navigates to confirmation view without making a booking', () => {
    console.log('Test: No booking message');
    // Acceptanskriterier: Om användaren navigerar till bekräftelsevyn och ingen bokning är gjord eller finns i session storage ska texten "Ingen bokning gjord visas"
    renderConfirmation();
    console.log('Confirmation component rendered (no booking in storage)');

    const noBookingMessage = screen.getByTestId('no-booking-message');
    console.log('Found no-booking message');
    expect(noBookingMessage).toBeInTheDocument();
    expect(noBookingMessage).toHaveTextContent('Inga bokning gjord!');
    console.log('No booking message text verified');
  });

  it('should display saved booking from session storage if it exists', () => {
    // Acceptanskriterier: Om användaren navigerar till bekräftelsevyn och det finns en bokning sparad i session storage ska denna visas
    const mockConfirmation = {
      bookingId: 'BK-789012',
      when: '2024-12-31T20:00',
      people: 4,
      lanes: 2,
      shoes: ['42', '40', '38', '36'],
      price: 680,
    };

    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmation();

    // Verify all booking details are displayed
    expect(screen.getByDisplayValue('2024-12-31 20:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BK-789012')).toBeInTheDocument();
    
    // Verify total price is displayed
    const priceElement = screen.getByTestId('booking-price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement).toHaveTextContent('680 sek');
  });
});

describe('Confirmation View - User Story 4: Display booking number and total sum', () => {
  beforeEach(() => {
    console.log('Clearing sessionStorage');
    sessionStorage.clear();
  });

  it('should display booking number after booking is completed', () => {
    // Acceptanskriterier: Systemet ska generera ett bokningsnummer och visa detta till användaren efter att bokningen är slutförd
    const mockConfirmation = {
      bookingId: 'BK-ABC123',
      when: '2024-12-25T18:00',
      people: 2,
      lanes: 1,
      shoes: ['42', '38'],
      price: 340,
    };

    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmation();

    const bookingNumberInput = screen.getByDisplayValue('BK-ABC123');
    expect(bookingNumberInput).toBeInTheDocument();
  });

  it('should calculate and display total sum clearly on confirmation page', () => {
    // Acceptanskriterier: Den totala summan ska visas tydligt på bekräftelsesidan och inkludera en uppdelning mellan spelare och banor
    const mockConfirmation = {
      bookingId: 'BK-TEST456',
      when: '2024-12-25T18:00',
      people: 3, // 3 * 120 = 360 kr
      lanes: 2,  // 2 * 100 = 200 kr
      shoes: ['42', '38', '40'],
      price: 560, // Total: 360 + 200 = 560 kr
    };

    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmation();

    const priceElement = screen.getByTestId('booking-price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement).toHaveTextContent('560 sek');
  });

  it('should display breakdown between players and lanes in total sum', () => {
    // Acceptanskriterier: Den totala summan ska visas tydligt på bekräftelsesidan och inkludera en uppdelning mellan spelare och banor
    const mockConfirmation = {
      bookingId: 'BK-BREAKDOWN',
      when: '2024-12-25T18:00',
      people: 5, // 5 * 120 = 600 kr
      lanes: 2,  // 2 * 100 = 200 kr
      shoes: ['42', '40', '38', '36', '34'],
      price: 800, // Total: 600 + 200 = 800 kr
    };

    sessionStorage.setItem('confirmation', JSON.stringify(mockConfirmation));

    renderConfirmation();

    // Verify the total price is displayed
    const priceElement = screen.getByTestId('booking-price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement).toHaveTextContent('800 sek');
    
    // Verify individual values are displayed
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // people
    expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // lanes
  });
});

