const XDate = require('xdate');

function sameMonth(a, b) {
  return (
    a instanceof XDate &&
    b instanceof XDate &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

function sameDate(a, b) {
  return (
    a instanceof XDate &&
    b instanceof XDate &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isGTE(a, b) {
  return b.diffDays(a) > -1;
}

function isLTE(a, b) {
  return a.diffDays(b) > -1;
}

function fromTo(a, b) {
  const days = [];
  let from = +a,
    to = +b;
  for (; from <= to; from = new XDate(from, true).addDays(1).getTime()) {
    days.push(new XDate(from, true));
  }
  return days;
}

function month(xd) {
  const year = xd.getFullYear(),
    month = xd.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  const firstDay = new XDate(year, month, 1, 0, 0, 0, true);
  const lastDay = new XDate(year, month, days, 0, 0, 0, true);

  return fromTo(firstDay, lastDay);
}

function monthPage(xd, firstDayOfWeek) {
  const days = month(xd);

  let before = [],
    after = [],
    last = [];

  const fdow = (7 + firstDayOfWeek) % 7 || 7;
  const ldow = (fdow + 6) % 7;

  firstDayOfWeek = firstDayOfWeek || 0;

  const from = days[0].clone();

  if (from.getDay() !== fdow) {
    from.addDays(-(from.getDay() + 7 - fdow) % 7);
  }

  const to = days[days.length - 1].clone();

  const day = to.getDay();
  if (day !== ldow) {
    to.addDays((ldow + 7 - day) % 7);
  }

  if (isLTE(from, days[0])) {
    before = fromTo(from, days[0]);
  }

  if (isGTE(to, days[days.length - 1])) {
    after = fromTo(days[days.length - 1], to);
  }

  const monthPage = before.concat(days.slice(1, days.length - 1), after);

  if (monthPage.length / 7 === 5) {
    const lastDate = monthPage[monthPage.length - 1].clone().addDays(1);

    last = fromTo(lastDate, lastDate.clone().addDays(6));
  }

  return monthPage.concat(last);
}

function weekPage(xd) {
  const firstDay = xd.clone().addDays(-xd.getDay());

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(firstDay.clone());
    firstDay.addDays(1);
  }

  return days;
}

module.exports = {
  sameMonth,
  sameDate,
  monthPage,
  weekPage,
  isGTE,
  isLTE,
};
