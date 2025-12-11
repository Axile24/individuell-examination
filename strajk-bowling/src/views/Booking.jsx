import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Booking.scss";

import BookingInfo from "../components/BookingInfo/BookingInfo";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";
import Navigation from "../components/Navigation/Navigation";
import Shoes from "../components/Shoes/Shoes";
import Top from "../components/Top/Top";

function Booking() {
  const [booking, setBooking] = useState({
    when: "",
    time: "",
    lanes: 0,
    people: 0,
  });
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateBookingDetails(event) {
    const { name, value } = event.target;
    console.log("Updating booking detail:", name, "=", value);
    setError("");

    setBooking((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function updateSize(event) {
    const { value, name } = event.target;
    setError("");

    if (value.length === 2 || value.length === 0) {
      setShoes((prevState) =>
        prevState.map((shoe) =>
          shoe.id === name ? { ...shoe, size: value } : shoe
        )
      );
    }
  }

  function addShoe(name) {
    console.log("Adding shoe field:", name);
    setError("");

    setShoes([...shoes, { id: name, size: "" }]);
    console.log("Total shoes:", shoes.length + 1);
  }

  function removeShoe(name) {
    console.log("Removing shoe field:", name);
    setError("");

    setShoes(shoes.filter((shoe) => shoe.id !== name));
    console.log("Remaining shoes:", shoes.length - 1);
  }

  function isShoeSizesFilled() {
    let filled = true;

    shoes.map((shoe) => (shoe.size.length > 0 ? filled : (filled = false)));

    return filled;
  }

  function checkPlayersAndLanes() {
    const MAX_PLAYERS_PER_LANE = 4;
    const maxPlayersAllows = booking.lanes * MAX_PLAYERS_PER_LANE;

    if (booking.people <= maxPlayersAllows) return true;

    return false;
  }

  async function sendBooking(bookingInfo) {
    console.log("Sending booking request:", bookingInfo);
    try {
      const response = await fetch(
        "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking",
        {
          method: "POST",
          headers: {
            "x-api-key": "strajk-B2mWxADrthdHqd22",
          },
          body: JSON.stringify(bookingInfo),
        }
      );
      
      if (!response.ok) {
        console.error("Booking request failed:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Booking response received:", data);
      return data;
    } catch (error) {
      console.error("Error sending booking:", error);
      throw error;
    }
  }

  function comparePeopleAndShoes() {
    return parseInt(booking.people) === shoes.length;
  }

  function saveConfirmation(confirmation) {
    return new Promise((resolve) => {
      console.log("Saving confirmation to sessionStorage:", confirmation);
      sessionStorage.setItem("confirmation", JSON.stringify(confirmation));
      console.log("Confirmation saved successfully");
      resolve();
    });
  }

  async function book() {
    console.log("Book function called");
    let errorMessage = "";

    if (
      !booking.when ||
      booking.lanes < 1 ||
      !booking.time ||
      booking.people < 1
    ) {
      errorMessage = "Alla fälten måste vara ifyllda";
      console.log("Validation error: Missing required fields");
    } else if (!comparePeopleAndShoes()) {
      errorMessage = "Antalet skor måste stämma överens med antal spelare";
      console.log("Validation error: People and shoes count mismatch", {
        people: booking.people,
        shoes: shoes.length
      });
    } else if (!isShoeSizesFilled()) {
      errorMessage = "Alla skor måste vara ifyllda";
      console.log("Validation error: Not all shoe sizes filled");
    } else if (!checkPlayersAndLanes()) {
      errorMessage = "Det får max vara 4 spelare per bana";
      console.log("Validation error: Too many players for lanes", {
        people: booking.people,
        lanes: booking.lanes,
        maxPlayers: booking.lanes * 4
      });
    }

    if (errorMessage) {
      console.log("Setting error message:", errorMessage);
      setError(errorMessage);
      return;
    }

    const bookingInfo = {
      when: `${booking.when}T${booking.time}`,
      lanes: booking.lanes,
      people: booking.people,
      shoes: shoes.map((shoe) => shoe.size),
    };

    console.log("Booking info prepared:", bookingInfo);

    try {
      const confirmation = await sendBooking(bookingInfo);
      console.log("Booking successful, saving confirmation:", confirmation.bookingDetails);
      await saveConfirmation(confirmation.bookingDetails);
      console.log("Confirmation saved to sessionStorage");
      
      navigate("/confirmation", {
        state: { confirmationDetails: confirmation.bookingDetails },
      });
    } catch (error) {
      console.error("Failed to complete booking:", error);
      setError("Ett fel uppstod vid bokningen. Försök igen.");
    }
  }

  return (
    <section className="booking">
      <Navigation />
      <Top title="Booking" />
      <BookingInfo updateBookingDetails={updateBookingDetails} />
      <Shoes
        updateSize={updateSize}
        addShoe={addShoe}
        removeShoe={removeShoe}
        shoes={shoes}
      />
      {/* data-testid needed for testing the booking submission button */}
      <button className="button booking__button" onClick={book} data-testid="submit-booking-button">
        strIIIIIike!
      </button>
      {error ? <ErrorMessage message={error} /> : ""}
    </section>
  );
}

export default Booking;
