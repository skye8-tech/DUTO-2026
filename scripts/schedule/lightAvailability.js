// Using the Open-Meteo to estimate light availability

const CITY_COORDS = {
  yaounde: { lat: 3.85, lon: 11.52, label: "Yaoundé" },
  douala: { lat: 4.05, lon: 9.71, label: "Douala" },
  bafoussam: { lat: 5.48, lon: 10.42, label: "Bafoussam" },
  bamenda: { lat: 5.96, lon: 10.15, label: "Bamenda" },
  garoua: { lat: 9.30, lon: 13.40, label: "Garoua" },
  maroua: { lat: 10.59, lon: 14.32, label: "Maroua" },
  ngaoundere: { lat: 7.32, lon: 13.58, label: "Ngaoundéré" },
  other: { lat: 3.85, lon: 11.52, label: "Other" }
};

function fallbackLight(time) {
  let hour = Number(String(time).split(":")[0]);
  if (hour >= 22 || hour < 6) return 30;
  if (hour >= 18) return 55;
  return 80;
}

function lightBadgeClass(percent) {
  if (percent >= 70) return "light-high";
  if (percent >= 40) return "light-medium";
  return "light-low";
}

function lightPrepTip(percent) {
  if (percent < 40) {
    return "High rain/outage risk — charge devices & print notes in advance";
  }
  if (percent < 70) {
    return "Moderate conditions expected";
  }
  return "Good conditions expected";
}

function estimateLightFromWeather(date, time, city) {
  let coords = CITY_COORDS[city] || CITY_COORDS.other;
  let hour = String(time).slice(0, 2);
  let target = date + "T" + hour + ":00";

  let url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + coords.lat +
    "&longitude=" + coords.lon +
    "&hourly=precipitation_probability" +
    "&timezone=Africa%2FDouala" +
    "&start_date=" + date +
    "&end_date=" + date;

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Weather request failed");
      }
      return response.json();
    })
    .then(function (data) {
      let times = data.hourly && data.hourly.time;
      let precip = data.hourly && data.hourly.precipitation_probability;

      if (!times || !precip) {
        return fallbackLight(time);
      }

      let i;
      let rainChance = 40; 

      for (i = 0; i < times.length; i++) {
        // times look like "2026-08-04T14:00"
        if (times[i].indexOf(date + "T" + hour) === 0) {
          rainChance = precip[i];
          if (rainChance === null || rainChance === undefined) {
            rainChance = 40;
          }
          break;
        }
      }

      let light = 100 - rainChance;

      let h = Number(hour);
      if (h >= 22 || h < 6) {
        light = light - 15;
      }

      if (light < 15) light = 15;
      if (light > 95) light = 95;

      return Math.round(light);
    })
    .catch(function () {
      return fallbackLight(time);
    });
}