import "./ErrorMessage.scss";

function ErrorMessage({ message }) {
  // data-testid needed for testing error message display
  console.log("Error message displayed:", message);
  return (
    <article className="error-message" data-testid="error-message">
      <p className="error-message__text">{message}</p>
    </article>
  );
}

export default ErrorMessage;
