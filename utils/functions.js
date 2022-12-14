export const titleCase = (s = "no") =>
  s ||
  s?.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase()
  );

export const levelsToShow = [
  {
    label: "Level One - Beginner/Intermediate",
    value: "level_one",
    detail:
      "You have had one or two blues dance classes and are ready to know more about Blues.",
  },
  {
    label: "Level Two - Advanced",
    value: "level_two",
    detail:
      "You have had local classes and maybe one or more international workshops. You can execute the basic movements and steps. You know some variations of basics and you can choose them depending on the style of music.",
  },
];

export const getPrice = (requestData, isGroupDiscount) => {
  const initialPrice = requestData.ticket === "partyPass" ? 95 : 195;
  const competitions =
    requestData.competition === "yes"
      ? requestData.competitions?.length * 10
      : 0;
  const theme_class =
    requestData.theme_class === "no" || requestData.theme_class === "" ? 0 : 40;
  const fullPassdiscount =
    requestData.ticket === "weekend_pass" &&
    requestData.competition === "yes" &&
    requestData.competitions?.length > 0
      ? -10
      : 0;
  const totalPrice =
    initialPrice + competitions + theme_class + fullPassdiscount;
  const output = isGroupDiscount
    ? Math.round((totalPrice / 100) * 90)
    : totalPrice;
  return output;
};

export const statusList = [
  {
    value: "registered",
    label: "1. Registration received",
  },
  {
    value: "email-sent",
    label: "2. Registration confirmation",
  },
  {
    value: "confirmed",
    label: "3. Payment received",
  },
  {
    value: "reminder",
    label: "4. Payment Reminder",
  },
  {
    value: "waitinglist",
    label: "5. Waiting list",
  },
  {
    value: "canceled",
    label: "6. registration canceled",
  },
  {
    value: "out",
    label: "7. They are out",
  },
];
