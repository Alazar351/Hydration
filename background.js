chrome.runtime.onMessage.addListener((data) => {
  const { event, prefs } = data;
  switch (event) {
    case "start":
      console.log("start works");
      console.log(prefs);
      console.log(prefs.currentlyActive);
      handleOnStart(prefs);
      break;
    case "pause":
      console.log("pause works");
      handleOnPause(prefs);
      break;
    default:
      break;
  }
});

const handleOnStart = (prefs) => {
  chrome.storage.local.set(prefs, function () {
    console.log("stored data");
  });

  prefrences = prefs;
  const { storedHours, storedAmount, selectedFreq } = prefs;
  if (intervalCount > selectedFreq) {
    chrome.storage.local.set(
      {
        displayMessage:
          "Something went wrong! Please press reset to begin again",
      },
      () => {
        console.log(
          `interval is greater than frequency  freq: ${selectedFreq} interval: ${intervalCount}`
        );
      }
    );
  } else if (storedHours && storedAmount) {
    chrome.storage.local.get(["alarmCounter"], (result) => {
      const { alarmCounter } = result;
      if (alarmCounter) {
        intervalCount = alarmCounter;
        console.log("interval count = " + intervalCount);
      }
    });
    chrome.alarms.create("timer", {
      delayInMinutes: prefrences.alarmTimer,
      periodInMinutes: prefrences.alarmTimer,
    });
    console.log(`alarm created. delayInMinutes = ${prefrences.alarmTimer}`);
  }
};

chrome.alarms.onAlarm.addListener(() => {
  console.log("alarm started");
  const { selectedFreq } = prefrences;

  createNotifications(prefrences);
  console.log(
    "intervalCount and selectedFrequency " + intervalCount + " " + selectedFreq
  );

  if (intervalCount == selectedFreq) {
    chrome.storage.local.set(
      {
        displayMessage:
          "Congratulations! You are hydrated! Press reset to begin again",
      },
      () => {
        console.log("interval is equal to frequency");
      }
    );
    chrome.alarms.clearAll();
    console.log("cleared all alarms");
    intervalCount++;
  }

  chrome.storage.local.set({ alarmCounter: intervalCount }, () => {
    console.log("interval has been set to " + intervalCount);
  });
});
let prefrences;
let intervalCount = 1;

const createNotifications = (prefs) => {
  const { alarmAlert, selectedUnit } = prefs;
  chrome.notifications.create({
    title: "Hydration Reminder",
    message: `It's time to drink ${alarmAlert} ${selectedUnit} of water`,
    iconUrl: "icon.png",
    type: "basic",
  });
  intervalCount++;
};

const handleOnPause = (prefs) => {
  chrome.storage.local.set(prefs, function () {
    console.log("pause stored data");
    console.log(prefs);
  });
  chrome.alarms.clearAll();
  console.log("alarms cleared");
};
