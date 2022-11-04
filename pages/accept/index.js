import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  PayPalScriptProvider,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";

import { titleCase } from "../../utils/functions";
import styles from "./accept.module.scss";
import Header from "../../components/Header/Header.js";
import Card from "../../components/Card/Card.js";

const CUSTOM_FIELD_STYLE = {
  border: "1px solid #606060",
  borderRadius: "4px",
  width: "300px",
  height: "40px",
  marginTop: "10px",
  padding: "10px",
  color: "blue",
};
const INVALID_COLOR = {
  color: "#dc3545",
};

// Example of custom component to handle form submit
const SubmitPayment = ({ customStyle }) => {
  const [paying, setPaying] = useState(false);
  const cardHolderName = useRef(null);
  const hostedField = usePayPalHostedFields();

  const handleClick = () => {
    if (!hostedField?.cardFields) {
      const childErrorMessage =
        "Unable to find any child components in the <PayPalHostedFieldsProvider />";

      action(ERROR)(childErrorMessage);
      throw new Error(childErrorMessage);
    }
    const isFormInvalid =
      Object.values(hostedField.cardFields.getState().fields).some(
        (field) => !field.isValid
      ) || !cardHolderName?.current?.value;

    if (isFormInvalid) {
      return alert("The payment form is invalid");
    }
    setPaying(true);
    hostedField.cardFields
      .submit({
        cardholderName: cardHolderName?.current?.value,
      })
      .then((data) => {
        // Your logic to capture the transaction
        fetch("url_to_capture_transaction", {
          method: "post",
        })
          .then((response) => response.json())
          .then((data) => {
            // Here use the captured info
          })
          .catch((err) => {
            // Here handle error
          })
          .finally(() => {
            setPaying(false);
          });
      })
      .catch((err) => {
        // Here handle error
        setPaying(false);
      });
  };

  return (
    <>
      <label style={{ gap: "20px" }}>
        <p>Card Holder Name</p>
        <input
          id="card-holder"
          ref={cardHolderName}
          className="card-field"
          style={{
            ...customStyle,
            outline: "none",
            marginTop: "10px",
            borderRadius: "4px",
            padding: "10px",
          }}
          type="text"
          placeholder="Full name"
        />
      </label>
      <button className={styles.button} onClick={handleClick}>
        {paying ? <div className="spinner tiny" /> : "Pay"}
      </button>
    </>
  );
};

function Checkout() {
  const [clientToken, setClientToken] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await (
        await fetch(
          "https://braintree-sdk-demo.herokuapp.com/api/paypal/hosted-fields/auth"
        )
      ).json();
      setClientToken(response?.client_token || response?.clientToken);
    })();
  }, []);

  return (
    <Card>
      {clientToken ? (
        <PayPalScriptProvider
          options={{
            "client-id":
              "AdOu-W3GPkrfuTbJNuW9dWVijxvhaXHFIRuKrLDwu14UDwTTHWMFkUwuu9D8I1MAQluERl9cFOd7Mfqe",
            components: "buttons,hosted-fields",
            "data-client-token": clientToken,
            intent: "capture",
            vault: false,
          }}
        >
          <PayPalHostedFieldsProvider
            styles={{
              ".valid": { color: "#28a745" },
              ".invalid": { color: "#dc3545" },
              input: { "font-family": "monospace", "font-size": "16px" },
            }}
            createOrder={function () {
              return fetch("your_custom_server_to_create_orders", {
                method: "post",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  purchase_units: [
                    {
                      amount: {
                        value: "2", // Here change the amount if needed
                        currency_code: "USD", // Here change the currency if needed
                      },
                    },
                  ],
                  intent: "capture",
                }),
              })
                .then((response) => response.json())
                .then((order) => {
                  // Your code here after create the order
                  return order.id;
                })
                .catch((err) => {
                  alert(err);
                });
            }}
          >
            <div className={styles.payment}>
              <label htmlFor="card-number">
                <p>
                  Card Number<span style={INVALID_COLOR}>*</span>
                </p>
              </label>
              <PayPalHostedField
                id="card-number"
                className="card-field"
                style={CUSTOM_FIELD_STYLE}
                hostedFieldType="number"
                options={{
                  selector: "#card-number",
                  placeholder: "xxxx xxxx xxxx xxxx",
                }}
              />
              <label htmlFor="cvv">
                <p>
                  CVV<span style={INVALID_COLOR}>*</span>
                </p>
              </label>
              <PayPalHostedField
                id="cvv"
                className="card-field"
                style={CUSTOM_FIELD_STYLE}
                hostedFieldType="cvv"
                options={{
                  selector: "#cvv",
                  placeholder: "xxx",
                  maskInput: true,
                }}
              />
              <label htmlFor="expiration-date">
                <p>
                  Expiration Date
                  <span style={INVALID_COLOR}>*</span>
                </p>
              </label>
              <PayPalHostedField
                id="expiration-date"
                className="card-field"
                style={CUSTOM_FIELD_STYLE}
                hostedFieldType="expirationDate"
                options={{
                  selector: "#expiration-date",
                  placeholder: "MM/YYYY",
                }}
              />
              <SubmitPayment
                customStyle={{
                  border: "1px solid #606060",
                  padding: "10px",
                }}
              />
            </div>
          </PayPalHostedFieldsProvider>
        </PayPalScriptProvider>
      ) : (
        <h4>Loading token...</h4>
      )}
    </Card>
  );
}

// import { unstable_useFormState as useFormState } from "reakit/Form";

// const CheckoutForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (elements == null) {
//       return;
//     }

//     const { error, paymentMethod } = await stripe.createPaymentMethod({
//       theme: "stripe",
//       type: "card",
//       card: elements.getElement(CardElement),
//     });
//   };

//   return (
//     <form style={{ width: "380px" }} onSubmit={handleSubmit}>
//       <CardElement />
//       <button
//         className={styles.button}
//         type="submit"
//         disabled={!stripe || !elements}
//       >
//         Pay
//       </button>
//     </form>
//   );
// };

// const stripePromise = loadStripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");
export default function Home({ tickets }) {
  //   const isMobile = useMedia({ maxWidth: "768px" });
  let user = null;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("accepted"));
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>The Grind</title>
        <meta name="description" content="The Grind Registration" />
        <link rel="icon" href="/icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amatic+SC&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header title="The Grind" menuItems={[{ title: "Home", link: "" }]} />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.title}>
            <h3>Thank you for your registration!</h3>
            <p>
              You will get a confirmation of your sign up by email. Then give us
              a little time to process your registration. Thank you.
            </p>
          </div>
          {user &&
            Object.entries(user).map(([key, val], i) => {
              if (
                (key === "level" || key === "role") &&
                user.ticket === "partyPass"
              ) {
                return;
              }
              return (
                <div className={styles.row} key={i}>
                  <p>{titleCase(key)}:</p>{" "}
                  <p>{key === "terms" ? "yes" : titleCase(val)}</p>
                </div>
              );
            })}
          <div style={{ marginTop: "20px" }}>
            <Checkout />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          style={{ width: "auto" }}
          href="https://hamedjenabi.me"
          target="_blank"
          rel="noreferrer"
        >
          Powered with love by Hamed
        </a>
      </footer>
    </div>
  );
}
