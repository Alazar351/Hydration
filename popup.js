const hours = document.getElementById("hours");
const amount = document.getElementById("amount");
const display = document.getElementById("display");
const start = document.getElementById("start");
const pause = document.getElementById("pause");
const reset = document.getElementById("reset");
const ifreq = document.getElementById("ifreq");
const nfreq = document.getElementById("nfreq");
const freq = document.getElementById("freq");
const oz = document.getElementById("oz");
const liter = document.getElementById("liter");

chrome.storage.local.get(
  [
    "storedHours",
    "storedAmount",
    "selectedUnit",
    "selectedFreq",
    "displayMessage",
    "currentlyActive",
    "alarmTimer",
    "alarmAlert",
  ],
  (result) => {
    const {
      storedHours,
      storedAmount,
      selectedUnit,
      selectedFreq,
      displayMessage,
      currentlyActive,
      alarmTimer,
      alarmAlert,
    } = result;

    display.textContent = displayMessage;
    console.log(`start up state of currentlyActive is ${currentlyActive}`);
    active(currentlyActive);
    if (alarmAlert) {
      displayDrinkAmt = alarmAlert;
    }
    if (storedHours && storedAmount) {
      allowed = true;
    }
    if (alarmTimer) {
      drinkT = alarmTimer;
    }
    if (storedHours) {
      console.log("hours here");
      hours.value = storedHours;
    }
    if (storedAmount) {
      console.log("amount here");
      amount.value = storedAmount;
    }
    if (selectedUnit == "fluid ounces") {
      console.log("fluid ounces here");
      if (currentlyActive == "pending") {
        enableElement(liter);
        disableElement(oz);
      }

      unit = "fluid ounces";
      amount.setAttribute("placeholder", "Fluid Ounce");
    }
    if (selectedFreq == 4) {
      mod = selectedFreq;
      if (currentlyActive == "pending") {
        disableElement(ifreq);
        enableElement(nfreq);
        enableElement(freq);
      }
    } else if (selectedFreq == 12) {
      mod = selectedFreq;
      if (currentlyActive == "pending") {
        enableElement(ifreq);
        enableElement(nfreq);
        disableElement(freq);
      }
    }
  }
);

let activity = "pending";

start.addEventListener("click", function () {
  calc(mod);
  if (allowed) {
    active("started");
    activity = "started";
  }
  const prefs = {
    storedHours: hours.value,
    storedAmount: amount.value,
    selectedUnit: unit,
    selectedFreq: mod,
    displayMessage: display.textContent,
    currentlyActive: activity,
    alarmTimer: drinkT,
    alarmAlert: displayDrinkAmt,
  };
  chrome.runtime.sendMessage({ event: "start", prefs });
});

pause.addEventListener("click", function () {
  handleOnPause();
});

const handleOnPause = () => {
  active("paused");
  activity = "paused";
  const prefs = {
    storedHours: hours.value,
    storedAmount: amount.value,
    selectedUnit: unit,
    selectedFreq: mod,
    displayMessage: display.textContent,
    currentlyActive: activity,
    alarmTimer: drinkT,
    alarmAlert: displayDrinkAmt,
  };
  chrome.runtime.sendMessage({ event: "pause", prefs });
};

reset.addEventListener("click", function () {
  handleOnReset();
});

let mod = 8;
let unit = "mL";

oz.addEventListener("click", function () {
  unit = "fluid ounces";
  disableElement(oz);
  enableElement(liter);
  amount.setAttribute("placeholder", "Fluid Ounces");
});

liter.addEventListener("click", function () {
  unit = "mL";
  disableElement(liter);
  enableElement(oz);
  amount.setAttribute("placeholder", "Liter");
});

ifreq.addEventListener("click", function () {
  mod = 4;
  disableElement(ifreq);
  enableElement(nfreq);
  enableElement(freq);
});
nfreq.addEventListener("click", function () {
  mod = 8;
  enableElement(ifreq);
  disableElement(nfreq);
  enableElement(freq);
});
freq.addEventListener("click", function () {
  mod = 12;
  enableElement(ifreq);
  enableElement(nfreq);
  disableElement(freq);
});

let drinkT;
let displayDrinkAmt;
let allowed = false;

const active = (status) => {
  if (status == "started") {
    disableElement(start);
    disableElement(ifreq);
    disableElement(nfreq);
    disableElement(freq);
    disableElement(liter);
    disableElement(oz);
    enableElement(pause);
  } else if (status == "paused") {
    enableElement(start);
    disableElement(pause);
    disableElement(ifreq);
    disableElement(nfreq);
    disableElement(freq);
    disableElement(liter);
    disableElement(oz);
  }
};

const calc = (modifier) => {
  let milliseconds = hours.value * 60 * 60 * 1000;
  let mL = amount.value * 1000;
  if (unit == "fluid ounces") {
    mL = mL / 1000;
  }

  let amtToDrink;
  if (unit == "mL") {
    amtToDrink = Math.round(mL / modifier);
  } else {
    amtToDrink = (mL / modifier).toFixed(2);
  }
  let timeToDrink = milliseconds / modifier;
  let drinkTime = timeToDrink / 1000 / 60;
  displayDrinkAmt = amtToDrink;
  drinkT = drinkTime;

  if (amtToDrink == 0 && drinkTime == 0) {
    display.innerHTML =
      "Please enter how many hours are available and how much water you want to drink";
  } else if (amtToDrink == 0) {
    display.innerHTML = "Please enter how much water you want to drink";
  } else if (drinkTime == 0) {
    display.innerHTML = "Please enter how many hours are available";
  } else {
    allowed = true;
    display.innerHTML = `You have to drink ${amtToDrink} ${unit} of water in ${drinkTime} minutes`;
  }
};

const handleOnReset = () => {
  chrome.storage.local.clear();
  chrome.alarms.clearAll();
  location.reload();
};

const disableElement = (elem) => {
  elem.disabled = true;
};

const enableElement = (elem) => {
  elem.disabled = false;
};
