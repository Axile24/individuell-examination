import { http, HttpResponse } from 'msw';

// Mock handler for the booking POST request
export const handlers = [
  http.post(
    'https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking',
    async ({ request }) => {
      const body = await request.json();
      
      // Generate a mock booking ID
      const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate price: 120 kr per person + 100 kr per lane
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

