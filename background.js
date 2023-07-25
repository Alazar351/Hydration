chrome.runtime.onMessage.addListener((data) => {
  const { event, prefs } = data;
  switch (event) {
    case "start":
      handleOnStart(prefs);
      break;
    case "pause":
      handleOnPause(prefs);
      break;
    default:
      break;
  }
});

const handleOnStart = (prefs) => {
  chrome.storage.local.set(prefs, function () {

  });

  prefrences = prefs;
  const { storedHours, storedAmount, selectedFreq } = prefs;
  if (intervalCount > selectedFreq) {
    chrome.storage.local.set(
      {
        displayMessage:
          "Something went wrong! Please press reset to begin again",
      }, () => {
        intervalCount = 1;
      }
    );
  } else if (storedHours && storedAmount) {
    chrome.storage.local.get(["alarmCounter"], (result) => {
      const { alarmCounter } = result;
      if (alarmCounter) {
        intervalCount = alarmCounter;
      }
    });
    chrome.alarms.create("timer", {
      delayInMinutes: prefrences.alarmTimer,
      periodInMinutes: prefrences.alarmTimer,
    });
  }
};

chrome.alarms.onAlarm.addListener(() => {
  const { selectedFreq } = prefrences;

  createNotifications(prefrences);
 
  if (intervalCount == selectedFreq) {
    chrome.storage.local.set(
      {
        displayMessage:
          "Congratulations! You are hydrated! Press reset to begin again",
      }
    );
    chrome.alarms.clearAll();

    intervalCount++;
  }

  chrome.storage.local.set({ alarmCounter: intervalCount });
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
  chrome.storage.local.set(prefs);
  chrome.alarms.clearAll();
};
