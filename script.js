const account1 = {
  owner: "Mohammad Rezaee",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2021-04-01T10:17:24.185Z",
    "2024-05-08T14:11:59.604Z",
    "2024-06-09T17:01:17.194Z",
    "2024-06-05T23:36:17.929Z",
    "2024-06-03T10:51:36.790Z",
  ],
  currency: "IRR",
  locale: "fa-IR",
};

const account2 = {
  owner: "Daniel Brown; ",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

let arr = [200, 400, 150, 10, -15, 25, 158.6, -14, 1];

const formatMovementDate = function (date, local) {
  const calcDays = function (day1, day2) {
    return Math.round(Math.abs(day1 - day2) / (1000 * 60 * 60 * 24));
  };
  const passedDays = calcDays(new Date(), date);
  if (passedDays === 0) return "Today";
  if (passedDays === 1) return "Yesterday";
  if (passedDays <= 7) return `${passedDays} days ago`;
  else {
    return new Intl.DateTimeFormat(local).format(date);
  }
};
const formatCur = function (value, local, currency) {
  return new Intl.NumberFormat(local, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";
  const moves = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  moves.forEach(function (move, i) {
    const type = move > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(move, acc.locale, acc.currency);

    const html = `
  <div class="movements__row">
  <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
  <div class="movements__date">${displayDate}</div>
  <div class="movements__value">${formattedMov}</div>
</div>
  `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, current) => acc + current, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};
const calcDisplaySummary = function (acc) {
  const deposit = acc.movements
    .filter((move) => move > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formatCur(deposit, acc.locale, acc.currency);
  const withdrawal = acc.movements
    .filter((move) => move < 0)
    .reduce((acc, cur) => acc + cur);
  labelSumOut.textContent = formatCur(
    Math.abs(withdrawal),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter((move) => move > 0)
    .map((move) => (move * acc.interestRate) / 100)
    .filter((move) => move >= 1)
    .reduce((acc, cur) => acc + cur);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUserName = function (accounts) {
  accounts.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
    return acc.userName;
  });
};
createUserName(accounts);
const updateUi = function (acc) {
  displayBalance(acc);
  displayMovements(acc);
  calcDisplaySummary(acc);
};
let currentAccount, timer;

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get Started";

      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.userName === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    inputLoginPin.value = inputLoginUsername.value = "";

    containerApp.style.opacity = 100;

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    };
    const local = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(local, options).format(now);
    labelWelcome.textContent = `welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUi(currentAccount);
  }
});
let receiverAccount;
let amount;
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  receiverAccount = accounts.find(
    (acc) => acc.userName === inputTransferTo.value
  );
  amount = +inputTransferAmount.value;
  if (
    amount > 0 &&
    receiverAccount &&
    receiverAccount?.userName !== currentAccount.userName &&
    currentAccount.balance >= amount
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    inputTransferAmount.value = inputTransferTo.value = "";
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    updateUi(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});
btnClose.addEventListener("click", function (event) {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.userName === currentAccount.userName
    );
    console.log(index);
    accounts.splice(index, 1);
    console.log(accounts);
    inputClosePin.value = inputCloseUsername.value = "";
    containerApp.style.opacity = 0;
  }
});
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUi(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
    inputLoanAmount.value = "";
  }
});
const allMovementsOverall = accounts
  .map((acc) => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov);
console.log(allMovementsOverall);
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
