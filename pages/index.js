import Head from "next/head";
import Router from "next/router";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { emailRegex } from "../utils/validate";
import styles from "../styles/Home.module.scss";
import Header from "../components/Header/Header.js";
const RegistrationForm = dynamic(
  () => import("../components/Form/RegistrationForm.js"),
  { ssr: false }
);
import { unstable_useFormState as useFormState } from "reakit/Form";

export default function Home({ tickets }) {
  const [isClicked, setIsClicked] = useState(false);

  if (typeof window !== "undefined") {
    localStorage.removeItem("accepted");
  }
  const form = useFormState({
    values: {
      status: "registered",
      firstname: "",
      lastname: "",
      email: "",
      country: "",
      ticket: "weekend_pass",
      role: "",
      message: "",
      price: 90,
      terms: false,
    },
    onValidate: (values) => {
      const errors = {};
      if (!values.firstname) {
        errors.firstname = "please write your name";
      }
      if (!values.lastname) {
        errors.lastname = "please write your name";
      }
      if (!values.terms) {
        errors.terms = "please accept our terms and conditions";
      }
      if (
        !values.email ||
        !emailRegex.test(values.email.trim().toLowerCase())
      ) {
        errors.email = "Email is not valid";
      }
      if (Object.keys(errors).length > 0) {
        throw errors;
      }
    },
    onSubmit: (values) => {
      setIsClicked(true);
      const req = {
        ...form.values,
      };
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
        },
        body: JSON.stringify(req),
      })
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem("accepted-grind", JSON.stringify(form.values));
            Router.push("/accept");
          }
          if (response.status === 300) {
            localStorage.setItem("accepted-grind", JSON.stringify(form.values));
            Router.push("/waitinglist");
          }

          if (response.status === 301) {
            Router.push("/soldout");
          }
          if (response.status === 302) {
            Router.push("/alreadyRegistered");
          }
        })
        .catch((error) => console.log(error));
    },
  });
  return (
    <div className={styles.container}>
      <Head>
        <title>The Grind 2023</title>
        <meta name="description" content="The Grind Registration" />
        <meta
          property="og:image"
          content="https://www.bluesfever.eu/wp-content/uploads/2022/08/bff2022.png"
        />

        <link rel="icon" href="/icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amatic+SC&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header
        title="The Grind"
        menuItems={[
          {
            title: "Home",
            link: "https://bluesfever.eu/",
          },
        ]}
      />
      <main className={styles.main}>
        <RegistrationForm form={form} tickets={tickets} isClicked={isClicked} />
      </main>

      <footer className={styles.footer}>
        <a
          style={{ width: "auto" }}
          href="https://hamedjenabi.me"
          target="_blank"
          rel="noreferrer"
        >
          Made with love by Hamed
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const { getTickets } = await import("../db/db");
  const tickets = await getTickets();

  return {
    props: {
      tickets: tickets,
    },
  };
}
