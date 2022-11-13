import { GoogleSpreadsheet } from "google-spreadsheet";
import {
  insertRegistration,
  getTicketByName,
  updateTicketCapacity,
  updateTicketWaiting,
  isTicketAvailable,
  getUserByEmailAndName,
  updateUserInfo,
  // removeRegistration,
} from "../../db/db";
import {
  titleCase,
  getPrice,
  levelsToShow,
  discounts,
} from "../../utils/functions";

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**** GOOGLE SHEET STUFF ******/

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY;
const time = new Date();

//******** Send Email *********/
const sendEmail = async (msg) => {
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
//******** Level & Ticket Label *********/
const getLevelLabel = (level) => {
  if (level === "") {
    return "";
  }
  if (level !== "") {
    return titleCase(level);
  }
};
const getLevelLabelForEmail = (level) => {
  if (level === "") {
    return "";
  }
  if (level !== "") {
    const title = levelsToShow?.find((item) => item.value === level)?.label;
    return titleCase(title);
  }
};

const getTicketLabel = (ticket) => {
  if (ticket === "weekend_pass") {
    return "Weekend Pass";
  }
};

//******** prepare GOOGLE SHEET *********/

// const updateGoogle = async (user) => {
//   const date = new Date().toISOString();
//   const inputForGoogleSheet = {
//     status: user.status,
//     register_date: date,
//     email: user.email,
//     firstname: user.firstname,
//     lastname: user.lastname,
//     country: user.country,
//     ticket: user.ticket,
//     role: user.role,
//     level: user.level,
//     price: user.price,
//     themeClass: user.theme_class,
//     competition_role: user.competition_role,
//     competitions: user.competitions?.toString(),
//   };
//   // const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
//   try {
//     await doc.useServiceAccountAuth({
//       client_email: CLIENT_EMAIL,
//       private_key:
//         PRIVATE_KEY === undefined
//           ? console.log("error")
//           : PRIVATE_KEY.replace(/\\n/gm, "\n"),
//     });
//     await doc.loadInfo();
//     const sheet = doc.sheetsById[SHEET_ID];
//     const result = await sheet.addRow(inputForGoogleSheet);
//   } catch (e) {
//     console.error("Error: ", e);
//   }
// };

export default async function register(req, response) {
  const requestData = {
    date: time.toDateString(),
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    country: req.body.country,
    role: req.body.role ?? "",
    ticket: req.body.ticket ?? "",
    message: req.body.message ?? "",
    price: req.body.price ?? 90,
    terms: req.body.terms,
  };

  const { id: ticketId } = await getTicketByName("weekend_pass");
  const { capacity } = await isTicketAvailable(ticketId);
  const { waiting_list } = await isTicketAvailable(ticketId);

  const totalPrice = requestData.price;

  ///////   TODO: GET TOTAL PRICE ///////
  const ticket = getTicketLabel(requestData.ticket);
  const userswithSameEmail = await getUserByEmailAndName(requestData.email);
  let isAlreadyRegistered = false;
  if (userswithSameEmail) {
    isAlreadyRegistered =
      userswithSameEmail.email + userswithSameEmail.firstname ===
      requestData.email + requestData.firstname;
  }
  let template = "";
  let isSoldOut = false;
  //******** Check Capacity ********/
  if (isAlreadyRegistered) {
    // 302 -> already registered
    response.status(302).json();
  }

  if (!isAlreadyRegistered) {
    // await updateTicketCapacity(ticketId); TODO - update capacity??
    const user = {
      status: "registered",
      price: totalPrice.toString(),
      ...requestData,
    };

    const [{ id }] = await insertRegistration(user);
    template = "d-e856399171c4418ca63e88b5ae2cb877";
    // await updateGoogle(user);

    response.status(200).json();
    // send registration email
  }

  if (capacity <= 0 && !isAlreadyRegistered) {
    // 200 -> registered
    // 300 -> waiting list
    // 301 -> sold out
    // if (waiting_list > 0) {
    //   await updateTicketWaiting(ticketId);
    //   const user = {
    //     status: "waitinglist",
    //     price: totalPrice.toString(),
    //     ...requestData,
    //   };
    //   template = "d-52a8e8e3cff741c583127915ee291c39";
    //   const [{ id }] = await insertRegistration(user);
    //   // const userWithId = {
    //   //   id,
    //   //   status: "waitinglist",
    //   //   requestData,
    //   // };
    //   // await updateUserInfo(userWithId);
    //   // await updateGoogle(user);
    //   response.status(300).json();

    //   // waiting list email
    // }
    if (waiting_list <= 0 && !isAlreadyRegistered) {
      isSoldOut = true;
      // send sold out email
      response.status(301).json();
    }
  }
  const msg = {
    from: "thegrindhelsinki@gmail.com",
    to: `${requestData.email}`,
    template_id: template,
    dynamic_template_data: {
      firstname: `${requestData.firstname}`,
      lastname: `${requestData.lastname}`,
      country: `${requestData.country}`,
      role: `${requestData.role}`,
      level: `${getLevelLabelForEmail(requestData.level)}`,
      ticket: `${ticket}`,
      terms: `${requestData.terms}`,
      status: `${requestData.status}`,
      price: `${totalPrice}`,
    },
  };
  console.log("msg", msg);
  // const generageMessage = () => {
  //   if (user.status === "registered") {
  //     return "message";
  //   }
  //   if (user.status === "waiting_list") {
  //     return "message";
  //   }
  // };
  if (!isSoldOut) {
    await sendEmail(msg);
  }
  // await sendEmail(user.status, msg);
}
