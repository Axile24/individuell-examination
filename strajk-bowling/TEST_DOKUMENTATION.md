# Testdokumentation - Strajk Bowling

## Översikt

Detta dokument beskriver testningen av Strajk Bowling-applikationen, en webbapplikation för bokning av bowlingbanor.

## Bibliotek och Verktyg

### Testramverk och Bibliotek

- **Vitest** (v4.0.15) - Testramverk för JavaScript/TypeScript
- **React Testing Library** (v16.3.0) - Bibliotek för att testa React-komponenter
- **@testing-library/user-event** (v14.6.1) - Simulering av användarinteraktioner
- **@testing-library/jest-dom** (v6.9.1) - Ytterligare matchers för DOM-assertions
- **MSW (Mock Service Worker)** (v2.12.4) - Mockning av HTTP-anrop
- **jsdom** (v27.3.0) - DOM-miljö för tester

### Exempel på package.json konfiguration:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "msw": "^2.12.4",
    "vitest": "^4.0.15",
    "jsdom": "^27.3.0"
  }
}
```

## Teststruktur

### Testfiler

1. **Booking.test.jsx** - 18 tester för bokningsfunktionalitet
2. **Confirmation.test.jsx** - 6 tester för bekräftelsevyn
3. **Navigation.test.jsx** - 3 tester för navigering

**Totalt: 27 tester**

## Testade User Stories

### User Story 1: Boka datum, tid och antal spelare

**Tester:**

- Användaren kan välja datum och tid
- Användaren kan ange antal spelare (minst 1)
- Användaren kan reservera banor
- Felmeddelande vid tomma fält
- Felmeddelande vid negativa tal
- Felmeddelande vid otillräckligt antal banor

**Kod-exempel:**

```javascript
it("should allow user to select date and time from calendar and time picker", async () => {
  console.log("Test: Selecting date and time");
  const user = userEvent.setup();
  renderBooking();

  const dateInput = screen.getByTestId("input-when");
  const timeInput = screen.getByTestId("input-time");

  await user.type(dateInput, "2024-12-25");
  await user.type(timeInput, "18:00");

  expect(dateInput).toHaveValue("2024-12-25");
  expect(timeInput).toHaveValue("18:00");
});
```

### User Story 2: Välja skostorlek för varje spelare

**Tester:**

- Användaren kan ange skostorlek för varje spelare
- Användaren kan ändra skostorlek
- Möjlighet att välja skostorlek för alla spelare
- Översikt av valda skostorlekar
- Felmeddelande vid saknade skostorlekar
- Felmeddelande vid felaktigt antal skor

**Kod-exempel:**

```javascript
it("should allow user to enter shoe size for each player", async () => {
  console.log("Test: Entering shoe sizes");
  const user = userEvent.setup();
  renderBooking();

  const peopleInput = screen.getByTestId("input-people");
  await user.type(peopleInput, "2");

  const addShoeButton = screen.getByTestId("add-shoe-button");
  await user.click(addShoeButton);
  await user.click(addShoeButton);

  const shoeInput1 = getInputByLabel("Shoe size / person 1");
  const shoeInput2 = getInputByLabel("Shoe size / person 2");

  await user.type(shoeInput1, "42");
  await user.type(shoeInput2, "38");

  expect(shoeInput1).toHaveValue("42");
  expect(shoeInput2).toHaveValue("38");
});
```

### User Story 3: Ta bort skostorleksfält

**Tester:**

- Användaren kan ta bort skostorleksfält via "-"-knapp
- Systemet uppdaterar bokningen när skostorlek tas bort
- Borttagna spelare inkluderas inte i skorantalet och priset

**Kod-exempel:**

```javascript
it("should allow user to remove a previously selected shoe size field", async () => {
  const user = userEvent.setup();
  renderBooking();

  const addShoeButton = screen.getByTestId("add-shoe-button");
  await user.click(addShoeButton);
  await user.click(addShoeButton);

  const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
  expect(shoeInputs).toHaveLength(2);

  const removeButton = screen.getByTestId("remove-shoe-0");
  await user.click(removeButton);

  const remainingShoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
  expect(remainingShoeInputs).toHaveLength(1);
});
```

### User Story 4: Slutföra reservation och få bokningsnummer

**Tester:**

- Användaren kan slutföra bokningen via knapp
- Systemet genererar bokningsnummer
- Systemet beräknar och visar totalsumma (120 kr/person + 100 kr/bana)
- Totalsumma visas tydligt på bekräftelsesidan

**Kod-exempel:**

```javascript
it("should generate booking number and display it to user", async () => {
  console.log("Test: Booking number generation");
  const user = userEvent.setup();
  renderBooking();

  // Fyll i alla fält
  await user.type(dateInput, "2024-12-25");
  await user.type(timeInput, "18:00");
  await user.type(peopleInput, "2");
  await user.type(lanesInput, "1");

  // Lägg till skor
  const addShoeButton = screen.getByTestId("add-shoe-button");
  await user.click(addShoeButton);
  await user.click(addShoeButton);

  const shoeInputs = getAllInputsByLabel(/Shoe size \/ person \d+/);
  await user.type(shoeInputs[0], "42");
  await user.type(shoeInputs[1], "38");

  // Skicka bokning
  const submitButton = screen.getByTestId("submit-booking-button");
  await user.click(submitButton);

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith(
      "/confirmation",
      expect.any(Object)
    );
  });

  // Verifiera att bokningsnummer sparats
  const savedConfirmation = JSON.parse(sessionStorage.getItem("confirmation"));
  expect(savedConfirmation.bookingId).toBeTruthy();
});
```

### User Story 5: Navigera mellan vyer

**Tester:**

- Navigering från bokning till bekräftelse
- Visar "Ingen bokning gjord" om ingen bokning finns
- Visar sparad bokning från session storage
- Navigering via navigationsmenyn

**Kod-exempel:**

```javascript
it("should allow user to navigate from booking view to confirmation view", async () => {
  console.log("Test: Navigate to confirmation view");
  const user = userEvent.setup();
  renderNavigation();

  const navIcon = screen.getByTestId("nav-icon");
  await user.click(navIcon);

  const confirmationLink = screen.getByTestId("nav-confirmation");
  expect(confirmationLink).toBeInTheDocument();

  await user.click(confirmationLink);
  expect(mockNavigate).toHaveBeenCalledWith("/confirmation");
});
```

## Mock Service Worker (MSW)

MSW används för att mocka POST-anrop till API:et.

### Setup

**src/test/mocks/server.js:**

```javascript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

**src/test/mocks/handlers.js:**

```javascript
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post(
    "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking",
    async ({ request }) => {
      const body = await request.json();

      // Generera mock bokningsnummer
      const bookingId = `BK-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Beräkna pris: 120 kr per person + 100 kr per bana
      const price = body.people * 120 + body.lanes * 100;

      return HttpResponse.json({
        bookingDetails: {
          bookingId,
          when: body.when,
          people: body.people,
          lanes: body.lanes,
          shoes: body.shoes || [],
          price,
        },
      });
    }
  ),
];
```

**src/test/setup.js:**

```javascript
import { expect, afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { server } from "./mocks/server";

expect.extend(matchers);

// Starta MSW server innan alla tester
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Återställ handlers efter varje test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Stäng server efter alla tester
afterAll(() => server.close());
```

## Testkonfiguration

### vitest.config.js

```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
```

## GitHub Actions

Tester körs automatiskt via GitHub Actions vid push till main branch.

**.github/workflows/test.yml:**

```yaml
name: Run Tests

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: strajk-bowling/package-lock.json

      - name: Install dependencies
        working-directory: ./strajk-bowling
        run: npm ci

      - name: Run tests
        working-directory: ./strajk-bowling
        run: npm run test:run
```

## Testresultat

```
✓ src/views/Confirmation.test.jsx (6 tests)
✓ src/components/Navigation/Navigation.test.jsx (3 tests)
✓ src/views/Booking.test.jsx (18 tests)

Test Files  3 passed (3)
Tests  27 passed (27)
```

## Vad som har gjorts

### 1. Testimplementation

- Skrivit 27 tester som täcker alla user stories och acceptanskriterier
- Varje test har kommentarer som förklarar vilka acceptanskriterier som testas

### 2. MSW-konfiguration

- Konfigurerat Mock Service Worker för att mocka POST-anrop
- Mock-hanteraren genererar bokningsnummer och beräknar pris korrekt

### 3. GitHub Actions

- Skapat workflow för automatisk testkörning
- Tester körs vid push/pull request till main branch

### 4. data-testid attribut

- Lagt till data-testid attribut i komponenter för testbarhet
- Alla data-testid har kommentarer som motiverar varför de behövs

### 5. Console.log för debugging

- Lagt till console.log statements i alla tester för att spåra testkörning
- Hjälper med debugging och förståelse av testflöde

## Exempel på komplett test

```javascript
describe("Booking View - User Story 1: Book date, time and number of players", () => {
  beforeEach(() => {
    console.log("Clearing sessionStorage and resetting mocks");
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it("should allow user to select date and time from calendar and time picker", async () => {
    console.log("Test: Selecting date and time");
    // Acceptanskriterier: Användaren ska kunna välja ett datum och en tid från ett kalender- och tidvalssystem
    const user = userEvent.setup();
    renderBooking();
    console.log("Component rendered");

    const dateInput = screen.getByTestId("input-when");
    const timeInput = screen.getByTestId("input-time");
    console.log("Found date and time inputs");

    expect(dateInput).toBeInTheDocument();
    expect(timeInput).toBeInTheDocument();

    console.log("Typing date: 2024-12-25");
    await user.type(dateInput, "2024-12-25");
    console.log("Typing time: 18:00");
    await user.type(timeInput, "18:00");

    expect(dateInput).toHaveValue("2024-12-25");
    expect(timeInput).toHaveValue("18:00");
    console.log("Date and time values set correctly");
  });
});
```

## Testkommandon

```bash
# Köra alla tester
npm run test:run

# Köra tester i watch mode
npm test

# Köra tester med UI
npm run test:ui
```

## Sammanfattning

- **27 tester** som täcker alla user stories och acceptanskriterier
- **MSW** för mockning av API-anrop
- **GitHub Actions** för automatisk testkörning
- **React Testing Library** för komponenttestning
- **Vitest** som testramverk
- Alla tester går igenom och projektet är redo för inlämning
