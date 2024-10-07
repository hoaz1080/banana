import querystring from "querystring";
import { green, yellow, red, blue, cyan } from "console-log-colors";
import { getConfig, getData, checkIP } from "./utils.js";
import AxiosHelpers from "./helpers/axiosHelper.js";
import NTD from "./helpers/ApiService.js";
import fs from "fs";

//Lấy Data + Proxy
const accounts = getData("data.txt");
const proxies = fs.existsSync("../proxy.txt")
  ? getData("../proxy.txt")
  : getData("proxy.txt");

//Lấy config game ở file config.json
const conf = getConfig();

let numberThread = conf.numberThread; // số luồng chạy /1 lần
let ref_code = conf.ref_code || "";
const createAxiosInstance = (proxy) => {
  return new AxiosHelpers({
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
      "Content-Type": "application/json",
      Origin: "https://banana.carv.io",
      Priority: "u=0, i",
      Referer: "https://banana.carv.io/",
      "Sec-Ch-Ua": `"Not A;Brand";v="99", "Android";v="12"`,
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "Android",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "X-App-Id": "carv",
    },
    proxy: proxy ? proxy : false,
  });
};

const adjustNumberThread = (countPrx) => {
  if (numberThread > countPrx && countPrx > 0) {
    numberThread = countPrx;
  }
  if (countPrx === 0) {
    numberThread = 30;
  }
  return numberThread;
};

export const getAllTokens = async () => {
  const createChunks = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  numberThread = await adjustNumberThread(proxies.length);
  const accountChunks = createChunks(accounts, numberThread);
  for (const chunk of accountChunks) {
    const tasks = chunk.map(async (account) => {
      const globalIndex = accounts.indexOf(account);

      const proxy = proxies[globalIndex % proxies.length];

      if (!account) return;

      if (account) {
        const axiosInstance = createAxiosInstance(proxy);
        let stt = Number(globalIndex) + Number(1);
        const maskedProxy = proxy
          ? proxy.slice(0, -10) + "**********"
          : "No Proxy";
        console.log(`[#] Account ${stt} | Proxy: ${maskedProxy}`);
        console.log(`[#] Account ${stt} | Check IP...`);
        let checkIp = await checkIP(axiosInstance);
        if (checkIp) {
          console.log(`[#] Account ${stt} | Run at IP: ${checkIp}`);
        } else {
          console.log(
            yellow.bold(`[#] Account ${stt} | proxy lỗi: ${maskedProxy} !`)
          );
          return;
        }
        let ntd = new NTD(stt, axiosInstance);
        let urlData = querystring
          .unescape(account)
          .split("tgWebAppData=")[1]
          .split("&tgWebAppVersion")[0];
        let { token } = await ntd.login(urlData, ref_code);
        if (token) {
          fs.appendFileSync("token.txt", `${token}\n`);
        } else {
          ntd.log(`Chưa lấy được token`, "warning");
          return;
        }
      }
    });

    console.log(`Số luồng chạy: ${tasks.length} ...`);
    await Promise.all(tasks);
  }
};
getAllTokens();
