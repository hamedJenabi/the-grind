import { useState, useEffect, useRef } from "react";
import Head from "next/head";

import { titleCase } from "../../utils/functions";
import styles from "./accept.module.scss";
import Header from "../../components/Header/Header.js";
import Card from "../../components/Card/Card.js";

export default function Home({ tickets }) {
  //   const isMobile = useMedia({ maxWidth: "768px" });
  let user = null;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("accepted-grind"));
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
              Please note that your registration confirmation e-mail may end up
              in your junk mail or promotions folder so make sure to check those
              over the next few days. You will get a confirmation of your sign
              up by email. Then give us a little time to process your
              registration. Thank you.
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
