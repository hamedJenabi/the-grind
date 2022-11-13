import {
  titleCase,
  discounts,
  levelsToShow,
  statusList,
} from "../../utils/functions";
import {
  updateUserInfo,
  removeFromWaitingList,
  removeFromCapacity,
  addToWaitingList,
  getTicketByName,
  addToCapacity,
} from "../../db/db";
const getLevelLabelForEmail = (level) => {
  if (level === "") {
    return "";
  }
  if (level !== "") {
    const title = levelsToShow?.find((item) => item.value === level)?.label;
    return titleCase(title);
  }
};
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//******** Level & Ticket Label *********/
const getLevelLabel = (level) => {
  if (level === "levelOne") {
    return "Level 1";
  }
  if (level === "levelTwo") {
    return "Level 2";
  }
  if (level === "levelThree") {
    return "Level 3";
  }
  if (level === "") {
    return "";
  }
};
const getTicketLabel = (ticket) => {
  if (ticket === "partyPass") {
    return "Party Pass";
  }
  if (ticket === "weekend_pass") {
    return "Weekend Pass";
  }
};
export default async function edituser(req, response) {
  const statusListValues = [
    "registered",
    "reminder",
    "email-sent",
    "confirmed",
    "waitinglist",
    "canceled",
    "out",
  ];
  const time = new Date();
  const date = new Date().toISOString();

  const requestData = {
    status: req.body.status,
    prevStatus: req.body.prevStatus,
    date: time.toDateString(),
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    country: req.body.country,
    role: req.body.role ?? "",
    ticket: req.body.ticket ?? "",
    price: req.body.price,
    terms: req.body.terms,
  };

  console.log("requestData", requestData);
  const totalPrice = requestData.price;
  /***** GET PRICE AND LEVEL */
  const level = titleCase(requestData.level);
  const ticket = getTicketLabel(requestData.ticket);
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
  let template = "";
  if (!statusListValues.includes(req.body.status)) {
    response.status(401).json();
  } else {
    if (req.body.status === "email-sent") {
      // if (requestData.prevStatus === "waitinglist") {
      //   const ticketName =
      //     requestData.ticket === "partyPass"
      //       ? requestData.ticket
      //       : `${requestData.level}_${requestData.role}`;
      //   const { id: ticketId } = await getTicketByName(ticketName);
      //   await removeFromWaitingList(ticketId);
      //   await addToCapacity(ticketId);
      // }
      template = "d-4b57b76644e5420284af3ea0d3c9644b";
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: template,
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "reminder") {
      template = "d-d15b5c2095f8480f890b51c160c43fd6";
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: template,
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          date: `${requestData.date}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,

          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "waitinglist") {
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-75944ebe0ce746299129ec916c7704e0",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          themeClass: `${titleCase(requestData.theme_class)}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    if (req.body.status === "confirmed") {
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-bba04e98dc914547b9e36d8f6709f49c",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      await sendEmail(msg);
    }
    // and more conditions
    if (req.body.status === "cancelled") {
      const msg = {
        from: "thegrindhelsinki@gmail.com",
        to: `${requestData.email}`,
        template_id: "d-5485670ec4ff45e98553fdb8f82fb178",
        dynamic_template_data: {
          firstname: `${requestData.firstname}`,
          lastname: `${requestData.lastname}`,
          country: `${requestData.country}`,
          role: `${titleCase(requestData.role)}`,
          ticket: `${ticket}`,
          terms: `${requestData.terms}`,
          status: `${requestData.status}`,
          price: `${totalPrice}`,
        },
      };
      // await sendEmail(msg);
    }
    if (req.body.status === "cancelled") {
      const ticketName =
        requestData.ticket === "partyPass"
          ? requestData.ticket
          : `${requestData.level}_${requestData.role}`;
      const { id: ticketId } = await getTicketByName(ticketName);
      if (requestData.prevStatus === "waitinglist") {
        await removeFromWaitingList(ticketId);
      } else {
        await removeFromCapacity(ticketId);
      }
    }
    await updateUserInfo(req.body, totalPrice);
    response.status(200).json();
  }
}
