import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render Navigation component with router
const renderNavigation = () => {
  return render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation Component - User Story 5: Navigate between booking and confirmation views', () => {
  beforeEach(() => {
    console.log('Clearing navigation mock');
    mockNavigate.mockClear();
  });

  it('should allow user to navigate from booking view to confirmation view', async () => {
    console.log('Test: Navigate to confirmation view');
    // Acceptanskriterier: Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn när bokningen är klar
    const user = userEvent.setup();
    renderNavigation();
    console.log('Navigation component rendered');

    // Click on the navigation icon to show menu
    const navIcon = screen.getByTestId('nav-icon');
    console.log('Clicking navigation icon');
    await user.click(navIcon);

    // Find and click the confirmation link
    const confirmationLink = screen.getByTestId('nav-confirmation');
    expect(confirmationLink).toBeInTheDocument();
    console.log('Confirmation link found');
    
    console.log('Clicking confirmation link');
    await user.click(confirmationLink);
    expect(mockNavigate).toHaveBeenCalledWith('/confirmation');
    console.log('Navigation to /confirmation verified');
    console.log('Test passed: User can navigate to confirmation view');
  });

  it('should allow user to navigate from confirmation view to booking view', async () => {
    console.log('Test: Navigate to booking view');
    // Acceptanskriterier: Användaren ska kunna navigera mellan boknings-och bekräftelsevyn
    const user = userEvent.setup();
    renderNavigation();
    console.log('Navigation component rendered');

    // Click on the navigation icon to show menu
    const navIcon = screen.getByTestId('nav-icon');
    console.log('Clicking navigation icon');
    await user.click(navIcon);

    // Find and click the booking link
    const bookingLink = screen.getByTestId('nav-booking');
    expect(bookingLink).toBeInTheDocument();
    console.log('Booking link found');
    
    console.log('Clicking booking link');
    await user.click(bookingLink);
    expect(mockNavigate).toHaveBeenCalledWith('/');
    console.log('Navigation to / verified');
    console.log('Test passed: User can navigate to booking view');
  });

  it('should toggle menu visibility when clicking navigation icon', async () => {
    console.log('Test: Menu toggle visibility');
    // Test that the navigation menu can be toggled
    const user = userEvent.setup();
    renderNavigation();
    console.log('Navigation component rendered');

    const navIcon = screen.getByRole('img');
    
    // Initially menu should be hidden
    const bookingLink = screen.getByTestId('nav-booking');
    const confirmationLink = screen.getByTestId('nav-confirmation');
    console.log('Found navigation links');
    
    // Check if links have 'hide' class initially (menu is hidden)
    expect(bookingLink).toHaveClass('hide');
    expect(confirmationLink).toHaveClass('hide');
    console.log('Menu initially hidden');

    // Click to show menu
    console.log('Clicking icon to show menu');
    await user.click(navIcon);
    
    // After clicking, links should not have 'hide' class
    expect(bookingLink).not.toHaveClass('hide');
    expect(confirmationLink).not.toHaveClass('hide');
    console.log('Menu now visible');

    // Click again to hide menu
    console.log('Clicking icon to hide menu');
    await user.click(navIcon);
    
    // Links should have 'hide' class again
    expect(bookingLink).toHaveClass('hide');
    expect(confirmationLink).toHaveClass('hide');
    console.log('Menu hidden again');
    console.log('Test passed: Menu visibility toggles correctly');
  });
});

