import fs from "fs";
import figlet from "figlet";
import { exit } from "process";

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function convertTimeRunAt(futureTime) {
  let hours = futureTime.getHours();
  let minutes = futureTime.getMinutes();
  let seconds = futureTime.getSeconds();

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  console.log(`Run next at: ${hours}:${minutes}:${seconds}`);
}

export function timeRunAt(time) {
  let now = new Date();
  let futureTime = new Date(now.getTime() + time * 1000);
  return futureTime;
}

export async function countdown(seconds) {
  convertTimeRunAt(timeRunAt(seconds));
  console.log(await createFigletText("END BANANA"));
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function getConfig() {
  try {
    const fileContent = fs.readFileSync("config.json", "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading or parsing file:", error);
  }
}

export function contentId(t, i) {
  return (t * i) % t;
}

export const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

export function getData(filename) {
  return fs
    .readFileSync(filename, "utf8")
    .toString()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
}

export function formatDateTime(dateTime, moreTime) {
  const date = new Date(dateTime);
  if (moreTime) {
    date.setHours(date.getHours() + moreTime);
  }
  return date;
}
export function formatDateToString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function timestampTimeExceeded(syncAt, hours) {
  return syncAt + hours * 60 * 60;
}

export const checkIP = async (axios) => {
  try {
    const rs = await axios.get("https://api.myip.com");
    const ip = rs.data?.ip;
    const country = rs.data?.country;
    return `${ip} - Country: ${country}`;
  } catch (err) {
    return null;
  }
};
export const getUserDataFromUrl = (encodedString) => {
  let decodedString = decodeURIComponent(encodedString);
  let userStartIndex = decodedString.indexOf("user=") + "user=".length;
  let userEndIndex = decodedString.indexOf("}", userStartIndex) + 1;
  let userJSON = decodedString.substring(userStartIndex, userEndIndex);

  let userObject = JSON.parse(userJSON);

  return userObject;
};
export const createFigletText = (text, font = "Small") => {
  return new Promise((resolve, reject) => {
    figlet.text(text, { font }, (err, data) => {
      if (err) {
        reject("Something went wrong...");
      } else {
        resolve(data);
      }
    });
  });
};

export const getRandomDecimal = (min, max, decimalPlaces) => {
  const randomValue = Math.random() * (max - min) + min;
  return parseFloat(randomValue.toFixed(decimalPlaces));
};

//Debug
export const dumd = (data) => {
  console.log(data);
  console.log('DEBUG');
  exit();
}

