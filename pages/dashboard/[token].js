import Head from "next/head";
import useMedia from "use-media";
import Router from "next/router";
import { useRouter } from "next/router";
import { CSVLink, CSVDownload } from "react-csv";
import React, { useState } from "react";
import styles from "./Dashboard.module.scss";
import Header from "../../components/Header/Header.js";
import classNames from "classnames";
import { levelsToShow, titleCase, statusList } from "../../utils/functions";
import { unstable_FormCheckbox as FormCheckbox } from "reakit/Form";
import { unstable_useFormState as useFormState } from "reakit/Form";

export default function Dashboard({ users, tickets }) {
  const [nameSearch, setNameSearch] = useState("");
  const [activeSideBar, setActiveSideBar] = useState("all");
  const [capacityShow, setCapacityShow] = useState(false);
  const [userToShow, setUserToShow] = useState(users || []);
  const isMobile = useMedia({ maxWidth: "768px" });
  const totalAmount = users.reduce((acc, user) => {
    return (
      acc +
      (user.status !== "canceled" && user.status !== "out"
        ? parseInt(user.price, 10)
        : 0)
    );
  }, 0);
  const totalAmountList = userToShow.reduce((acc, user) => {
    return (
      acc +
      (user.status !== "canceled" && user.status !== "out"
        ? parseInt(user.price, 10)
        : 0)
    );
  }, 0);
  const router = useRouter();

  const form = useFormState({
    values: {
      status: "",
      users: [],
    },

    onSubmit: (values) => {
      setIsClicked(true);
      const req = {
        ...form.values,
      };
    },
  });
  const [status, setStatus] = useState("");
  const [usersToChange, setUsersToChange] = useState([]);

  const handleStatusChange = async () => {
    const idsToChange = form.values.users;
    let array = [];
    idsToChange.map((id) => {
      array.push(users.find((userinfo) => userinfo.id === id));
    });

    array.map((item) => {
      const toEdit = {
        ...item,
        firstname: item.firstname,
        lastname: item.lastname,
        status: status,
      };
      fetch("/api/edituser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store",
        },
        body: JSON.stringify(toEdit),
      })
        .then((response) => {
          if (response.status === 200) {
            router.reload(window.location.pathname);
          }
          if (response.status === 401) {
            alert("Please write a valid status");
          }
        })
        .catch((error) => console.log(error));
    });
    alert("done");
  };
  const BalanceComponent = () => {
    const getTicketAmount = (role, status) => {
      const registerAmount = users.filter(
        (user) => user["role"] === role && user["status"] === status
      );
      // const ammount = users.filter(
      //   (user) =>
      //     user["level"] === level &&
      //     user["role"] === role &&
      //     user["status"] === "email-sent"
      // );
      // const ammountReminder = users.filter(
      //   (user) =>
      //     user["level"] === level &&
      //     user["role"] === role &&
      //     user["status"] === "reminder"
      // );
      // const ammountWaiting = users.filter(
      //   (user) =>
      //     user["level"] === level &&
      //     user["role"] === role &&
      //     user["status"] === "waitinglist"
      // );
      // const ammountPaid = users.filter(
      //   (user) =>
      //     user["level"] === level &&
      //     user["role"] === role &&
      //     user["status"] === "confirmed"
      // );
      // return {
      //   registered: registerAmount.length,
      //   sent: ammount.length,
      //   reminder: ammountReminder.length,
      //   waiting: ammountWaiting.length,
      //   paid: ammountPaid.length,
      // };
      return registerAmount.length;
    };

    return (
      <div className={styles.balanceComponent}>
        <div className={styles.ticketRow}>
          <div className={styles.ticketAmount}>
            <h4>Follow</h4>
            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("follow", status.value)}
              </p>
            ))}
          </div>
          <div className={styles.ticketAmount}>
            <h4>Lead</h4>

            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("lead", status.value)}
              </p>
            ))}
          </div>
          <div className={styles.ticketAmount}>
            <h4>Switch</h4>

            {statusList.map((status) => (
              <p key={status.value}>
                {status.label}: {getTicketAmount("switch", status.value)}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };
  if (typeof window !== "undefined") {
    const admin = localStorage.getItem("login_admin");
    if (admin !== "true") {
      Router.push("/login/admin");
    }
  }

  const handleSideBarClick = (item) => {
    if (item !== "capacity") {
      setCapacityShow(false);
    }
    if (item === "out") {
      setUserToShow(users.filter((user) => user["status"] === "out"));
    } else if (item === "canceled") {
      setUserToShow(users.filter((user) => user["status"] === "canceled"));
    } else if (item === "all") {
      setUserToShow(users);
    } else if (levelsToShow.some((level) => level.value === item)) {
      setUserToShow(users.filter((user) => user.level === item));
    } else if (item === "shirt") {
      setUserToShow(users.filter((user) => user["shirt"] === "yes"));
    } else if (item === "theme_class") {
      setUserToShow(
        users.filter(
          (user) => user["theme_class"] !== "no" && user["theme_class"] !== ""
        )
      );
    } else if (item === "email-sent") {
      setUserToShow(users.filter((user) => user["status"] === "email-sent"));
    } else if (item === "reminder") {
      setUserToShow(users.filter((user) => user["status"] === "reminder"));
    } else if (item === "partyPass") {
      setUserToShow(users.filter((user) => user["ticket"] === "partyPass"));
    } else if (item === "confirmed") {
      setUserToShow(users.filter((user) => user["status"] === "confirmed"));
    } else if (item === "waitinglist") {
      setUserToShow(users.filter((user) => user["status"] === "waitinglist"));
    } else if (item === "registered") {
      setUserToShow(users.filter((user) => user["status"] === "registered"));
    } else {
      setUserToShow(users.filter((user) => user[item] === item));
    }
    if (item === "capacity") {
      setCapacityShow(true);
    }
    setActiveSideBar(item);
  };

  const handleUser = (id) => {
    Router.push(`/dashboard/user/${id}`);
  };
  const renderTableHeader = () => {
    const header = [
      "select",
      "status",
      "price",
      "date",
      "actions",
      "id",
      "email",
      "firstname",
      "lastname",
      "ticket",
      "role",
      "country",
      "message",
      "terms",
    ];
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  //--------- Ticket Component
  const TicketsComponent = () => {
    const ticketToshow = [
      { name: "Level", capacity: "Capacity", waiting_list: "Waiting List" },
      ...tickets,
    ];
    return (
      <div className={styles.tickets}>
        {ticketToshow?.map((ticket) => (
          <div key={ticket.name} className={styles.ticketRow}>
            <div className={styles.ticketItem}>
              <p>{ticket.name}</p>
            </div>
            <div className={styles.ticketItem}>
              <p>{ticket.capacity}</p>
            </div>
            <div className={styles.ticketItem}>
              <p>{ticket.waiting_list}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  //--------- Table Data
  const getStatusLabel = (status) => {
    const { label } = statusList.find((item) => item.value === status);
    return label;
  };

  const renderTableData = () => {
    return userToShow
      .filter((user) =>
        nameSearch
          ? user.firstname.toUpperCase().includes(nameSearch.toUpperCase())
          : true
      )
      .sort((a, b) => a.id - b.id)
      .map(
        ({
          id,
          status,
          price,
          date,
          role,
          firstname,
          ticket,
          lastname,
          country,
          message,
          email,
        }) => {
          return (
            <tr
              key={id}
              className={classNames(styles.normal, {
                [styles.confirmed]: status === "confirmed",
                [styles.canceled]: status === "canceled",
                [styles.out]: status === "out",
                [styles.sent]: status === "email-sent",
                [styles.reminder]: status === "reminder",
              })}
            >
              <td>
                <label>
                  <FormCheckbox
                    style={{ width: "60px" }}
                    {...form}
                    name="users"
                    value={id}
                  />
                </label>
              </td>
              <td>{getStatusLabel(status)}</td>
              <td>{price}</td>
              <td>{date}</td>
              <td>
                <button
                  className={styles.button}
                  onClick={() => handleUser(id)}
                >
                  Edit
                </button>
              </td>
              <td>{id}</td>
              <td>{email}</td>
              <td>{firstname}</td>
              <td>{lastname}</td>
              <td>{ticket}</td>
              <td>{role}</td>
              <td>{country}</td>
              <td>{message ? "One Message" : "NO Message"}</td>
              <td>Yes</td>
            </tr>
          );
        }
      );
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>The Grind</title>
        <link rel="icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amatic+SC&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header
        isAdmin
        title="BFF DASHBOARD"
        menuItems={[
          {
            title: "LOG OUT ",
            link: "/login/admin",
          },
        ]}
      />
      <h3 className={styles.title}>Registrations</h3>
      <div className={styles.total}>
        <p>
          Total Registrations: {users?.length} = {totalAmount}
        </p>
        <p>
          Selected List:{" "}
          {
            userToShow?.filter(
              (user) => user.status !== "canceled" && user.status !== "out"
            )?.length
          }{" "}
          ={totalAmountList}
        </p>
      </div>
      <main className={styles.main}>
        <div className={styles.sideBar}>
          <div
            onClick={() => handleSideBarClick("all")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "all",
            })}
          >
            <p>All</p>
          </div>
          {statusList.map(({ value, label }) => (
            <div
              key={value}
              onClick={() => handleSideBarClick(value)}
              className={classNames(styles.sideBarItem, {
                [styles.active]: activeSideBar === value,
              })}
            >
              <p>{label}</p>
            </div>
          ))}
          <div
            onClick={() => handleSideBarClick("capacity")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "capacity",
            })}
          >
            <p>Capacity</p>
          </div>
          <div
            onClick={() => handleSideBarClick("balance")}
            className={classNames(styles.sideBarItem, {
              [styles.active]: activeSideBar === "balance",
            })}
          >
            <p>Balance</p>
          </div>
        </div>
        <div className={styles.content}>
          {activeSideBar !== "balance" && (
            <div className={styles.search}>
              <div>
                <select
                  onChange={(e) => setStatus(e.target.value)}
                  className={styles.select}
                >
                  {statusList.map(({ value, label }) => (
                    <option key={status} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.statusButton}
                  onClick={handleStatusChange}
                >
                  Change Status
                </button>
              </div>
              <p>Search first name</p>
              <input onChange={(e) => setNameSearch(e.target.value)} />
            </div>
          )}
          {!capacityShow && activeSideBar !== "balance" && (
            <table className={styles.table}>
              <tbody>
                <tr>{renderTableHeader()}</tr>
                {renderTableData()}
              </tbody>
            </table>
          )}
          {capacityShow && <TicketsComponent />}
          {activeSideBar === "balance" && <BalanceComponent />}
          {activeSideBar !== "balance" && (
            <div className={styles.downloadButton}>
              <CSVLink data={userToShow} filename={"registration-file.csv"}>
                Download CSV
              </CSVLink>
            </div>
          )}
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

export async function getServerSideProps() {
  const { getAllUsers, getTickets } = await import("../../db/db");
  const users = await getAllUsers();

  const tickets = await getTickets();
  return {
    props: {
      users: users,
      tickets: tickets,
    },
  };
}
