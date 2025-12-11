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
    mockNavigate.mockClear();
  });

  it('should allow user to navigate from booking view to confirmation view', async () => {
    // Acceptanskriterier: Användaren ska kunna navigera från bokningsvyn till bekräftelsevyn när bokningen är klar
    const user = userEvent.setup();
    renderNavigation();

    // Click on the navigation icon to show menu
    const navIcon = screen.getByTestId('nav-icon');
    await user.click(navIcon);

    // Find and click the confirmation link
    const confirmationLink = screen.getByTestId('nav-confirmation');
    expect(confirmationLink).toBeInTheDocument();
    
    await user.click(confirmationLink);
    expect(mockNavigate).toHaveBeenCalledWith('/confirmation');
  });

  it('should allow user to navigate from confirmation view to booking view', async () => {
    // Acceptanskriterier: Användaren ska kunna navigera mellan boknings-och bekräftelsevyn
    const user = userEvent.setup();
    renderNavigation();

    // Click on the navigation icon to show menu
    const navIcon = screen.getByTestId('nav-icon');
    await user.click(navIcon);

    // Find and click the booking link
    const bookingLink = screen.getByTestId('nav-booking');
    expect(bookingLink).toBeInTheDocument();
    
    await user.click(bookingLink);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should toggle menu visibility when clicking navigation icon', async () => {
    // Test that the navigation menu can be toggled
    const user = userEvent.setup();
    renderNavigation();

    const navIcon = screen.getByRole('img');
    
    // Initially menu should be hidden
    const bookingLink = screen.getByTestId('nav-booking');
    const confirmationLink = screen.getByTestId('nav-confirmation');
    
    // Check if links have 'hide' class initially (menu is hidden)
    expect(bookingLink).toHaveClass('hide');
    expect(confirmationLink).toHaveClass('hide');

    // Click to show menu
    await user.click(navIcon);
    
    // After clicking, links should not have 'hide' class
    expect(bookingLink).not.toHaveClass('hide');
    expect(confirmationLink).not.toHaveClass('hide');

    // Click again to hide menu
    await user.click(navIcon);
    
    // Links should have 'hide' class again
    expect(bookingLink).toHaveClass('hide');
    expect(confirmationLink).toHaveClass('hide');
  });
});

