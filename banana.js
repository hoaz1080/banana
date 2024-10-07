import querystring from "querystring";
import { green, yellow, red, blue, cyan, magenta } from "console-log-colors";
import {
  countdown,
  getConfig,
  sleep,
  getData,
  checkIP,
  createFigletText,
  randomInt,
  dumd,
} from "./utils.js";
import AxiosHelpers from "./helpers/axiosHelper.js";
import NTD from "./helpers/ApiService.js";
import fs from "fs";

// Lấy Data + Proxy
const accounts = getData("data.txt");
const proxies = fs.existsSync("../proxy.txt")
  ? getData("../proxy.txt")
  : getData("proxy.txt");

// Lấy config game ở file config.json
const conf = getConfig();

let timeRerun = conf.timeRerun;
let numberThread = conf.numberThread; // số luồng chạy /1 lần
let ref_code = conf.ref_code || "";
let max_usdt = conf.usdt;
let auto_task = conf.auto_task;
let search_banana = conf.search_banana;

const eligibleAccounts = [];

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

// end config
const calculateRemainingTime = (lotteryData) => {
  const lastCountdownStartTime = lotteryData.last_countdown_start_time || 0;
  const countdownInterval = lotteryData.countdown_interval || 0;
  const countdownEnd = lotteryData.countdown_end || false;

  if (!countdownEnd) {
    const currentTimeMillis = Date.now();
    const elapsedTimeMinutes =
      (currentTimeMillis - lastCountdownStartTime) / (1000 * 60);
    const remainingTimeMinutes = Math.max(
      countdownInterval - elapsedTimeMinutes,
      0
    );

    return remainingTimeMinutes;
  }
  return 0;
};

// main
const main = async (stt, account, ntd) => {
  try {
    let urlData = querystring
      .unescape(account)
      .split("tgWebAppData=")[1]
      .split("&tgWebAppVersion")[0];
    let { token } = await ntd.login(urlData, ref_code);
    if (token) {
      let urlData = querystring
        .unescape(account)
        .split("tgWebAppData=")[1]
        .split("&tgWebAppVersion")[0];
      let { token } = await ntd.login(urlData, ref_code);
      let remainingTimeMinutes = Infinity;
      let userInfo = await ntd.getUserInfo(token);
      if (!userInfo) return;
      let {
        peel,
        usdt,
        today_click_count: todayClickCount,
        max_click_count: maxClickCount,
        equip_banana_id: currentEquipBananaId,
        speedup_count: speedup,
      } = userInfo;
      ntd.log(
        `Balance: ${peel} - USDT: ${usdt} - Speed Up :${speedup} - Hôm nay đã tap:  ${todayClickCount} lần`,
        "start"
      );

      let lotteryInfoResponse = await ntd.getLotteryInfo(token);
      remainingTimeMinutes = calculateRemainingTime(lotteryInfoResponse || {});
      if (remainingTimeMinutes <= 0) {
        let isClaimLottery = await ntd.claimLottery(token);
        if (isClaimLottery) {
          ntd.log(`Đã claim thành công lottery`);
        }
        let updatedLotteryInfoResponse = await ntd.getLotteryInfo(token);
        remainingTimeMinutes = calculateRemainingTime(
          updatedLotteryInfoResponse || {}
        );
      }

      if (speedup > 0) {
        const maxSpeedups = speedup > 3 ? 3 : speedup;
        ntd.log(`Thực hiện speedup tối đa ${maxSpeedups} lần...`, "start");

        const speedupLotteryInfo = await ntd.doSpeedup(token, maxSpeedups);
        if (speedupLotteryInfo) {
          remainingTimeMinutes = calculateRemainingTime(speedupLotteryInfo);
        }
      }

      let remainingDuration = remainingTimeMinutes * 60;
      let remainingHours = Math.floor(remainingDuration / 3600);
      let remainingMinutes = Math.floor((remainingDuration % 3600) / 60);
      let remainingSeconds = Math.floor(remainingDuration % 60);
      ntd.log(
        `Thời gian còn lại để nhận Banana: ${remainingHours} Giờ ${remainingMinutes} phút ${remainingSeconds} giây`
      );
      let remainLotteryCount =
        (lotteryInfoResponse || {}).remain_lottery_count || 0;
      ntd.log(`Harvest Có Sẵn : ${remainLotteryCount}`);
      if (remainLotteryCount > 0) {
        let lotteryResult = await ntd.doLottery(token);
        if (lotteryResult) {
          let bananaName = lotteryResult.name || "N/A";
          let sellExchangeUsdt = lotteryResult.sell_exchange_usdt || "N/A";
          if (sellExchangeUsdt >= max_usdt) {
            ntd.log(
              `Harvest thành công ${bananaName} - Banana Name : ${bananaName} - Peel Limit: ${
                lotteryResult.daily_peel_limit || "N/A"
              } - Price: ${sellExchangeUsdt} USDT`,
              "other"
            );
          } else {
            ntd.log(
              `Harvest thành công ${bananaName} - Banana Name : ${bananaName} - Peel Limit: ${
                lotteryResult.daily_peel_limit || "N/A"
              } - Price: ${sellExchangeUsdt} USDT`
            );
          }
          await sleep(2);
        }
      }
      if (todayClickCount < maxClickCount) {
        const clickCount = maxClickCount - todayClickCount;
        if (clickCount > 0) {
          ntd.log(`Đã tap ${clickCount} lần...`);
          await ntd.doClick(token, clickCount);
          await sleep(2);
        } else {
          ntd.log("Không thể tap, đã đạt giới hạn tối đa!", "warning");
        }
      }

      if (auto_task) {
        let questListData = await ntd.getQuestList(token);
        let questList = (questListData || {}).quest_list || [];
        questList = questList.filter(
          (item) =>
            item.quest_id !== 1 &&
            item.quest_id !== 2 &&
            item.quest_id !== 11 &&
            item.quest_id !== 10 &&
            !(item.is_achieved === true && item.is_claimed === true)
        );
        for (const quest of questList) {
          const questName = quest.quest_name || "N/A";
          let isAchieved = quest.is_achieved || false;
          let isClaimed = quest.is_claimed || false;
          const questId = quest.quest_id;
          if (!isAchieved) {
            await ntd.achieveQuest(token, questId);
            await sleep(2);

            const updatedQuestListData = await ntd.getQuestList(token);
            const updatedQuest = updatedQuestListData.quest_list.find(
              (q) => q.quest_id === questId
            );
            isAchieved = updatedQuest.is_achieved || false;
          }
          if (isAchieved && !isClaimed) {
            await ntd.claimQuest(token, questId);
            await sleep(2);
            const updatedQuestListData = await ntd.getQuestList(token);
            const updatedQuest = updatedQuestListData.quest_list.find(
              (q) => q.quest_id === questId
            );
            isClaimed = updatedQuest.is_claimed || false;
          }
          let achievedStatus = isAchieved ? "Hoàn thành" : "Thất bại";
          let claimedStatus = isClaimed ? "Đã Claim" : "Chưa Claim";

          if (!questName.toLowerCase().includes("bind")) {
            ntd.log(
              `${`Làm nhiệm vụ `}${questName} ${"..."}Trạng thái : ${achievedStatus} | ${claimedStatus}`
            );
          }
        }

        //<--- Claim chuối phần task --->
        let countBananaTask = Math.floor(eval(questListData.progress));
        if (countBananaTask > 0) {
          for (let i = 0; i < countBananaTask; i++) {
            await ntd.claimQuestLottery(token);
          }
          ntd.log(
            `Đã claim ${countBananaTask} quả chuối được thưởng khi done task thành công!`
          );
        }

        if (search_banana) {
          const bestBananaList = await ntd.equipBestBanana(
            token,
            currentEquipBananaId
          );
          const { banana_list: bananas } = bestBananaList || {
            banana_list: [],
          };

          const eligibleBananas = bananas.filter((banana) => banana.count >= 1);

          const filteredBananas = eligibleBananas
            .filter((banana) => banana.sell_exchange_usdt >= max_usdt)
            .map((banana) => ({
              sell_exchange_usdt: banana.sell_exchange_usdt,
              count: banana.count,
            }));

          if (filteredBananas.length > 0) {
            const money = filteredBananas.reduce((sum, banana) => {
              return sum + banana.sell_exchange_usdt * banana.count;
            }, 0);
            eligibleAccounts.push({ stt: stt, money: money });
          }

          if (eligibleBananas.length > 0) {
            const bestBanana = eligibleBananas.reduce((prev, current) => {
              return prev.daily_peel_limit > current.daily_peel_limit
                ? prev
                : current;
            });

            if (bestBanana.banana_id === currentEquipBananaId) {
              ntd.log(
                `Đang sử dụng quả chuối tốt nhất ${bestBanana.name} - Tốc độ 🍌/DAY: ${bestBanana.daily_peel_limit}`
              );
            } else {
              const isEquipBanana = await ntd.equipBanana(
                token,
                bestBanana.banana_id
              );
              if (isEquipBanana && isEquipBanana.code === 0) {
                ntd.log(
                  `Đã Equip quả chuối tốt nhất: ${bestBanana.name} - Tốc độ 🍌/DAY: ${bestBanana.daily_peel_limit}`
                );
              } else {
                ntd.log(
                  "Sử dụng chuối thất bại! Thử lại vào lần tới",
                  "warning"
                );
              }
            }
          } else {
            ntd.log("Không có quả chuối nào được tìm thấy!", "warning");
          }
        }
      }
    }
  } catch (e) {
    console.log(`${stt} Main Err: ${e}`);
    await sleep(5);
  }
};

// end main
const adjustNumberThread = (countPrx) => {
  if (numberThread > countPrx && countPrx > 0) {
    numberThread = countPrx >= 30 ? 30 : countPrx;
  }
  if (countPrx === 0) {
    numberThread = 30;
  }
  return numberThread;
};

const readTokens = () => {
  return fs.readFileSync("token.txt", "utf8").trim().split("\n");
};
const runMulti = async () => {
  const createChunks = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  numberThread = await adjustNumberThread(proxies.length);

  const accountChunks = createChunks(accounts, numberThread);

  console.log(await createFigletText("START BANANA"));

  // Lặp từng mảng con trong mảng to (Chia luồng)
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
        await main(stt, account, ntd);
      }
    });

    console.log(`Số luồng chạy: ${tasks.length} ...`);
    await Promise.all(tasks);
  }

  if (eligibleAccounts.length > 0) {
    eligibleAccounts.sort((a, b) => a.stt - b.stt);
    console.log(magenta.bold(`Tài khoản lụm USDT > ${max_usdt}:`));
    eligibleAccounts.forEach((account) => {
      console.log(
        magenta.bold(`Account: ${account.stt} - Money: ${account.money} USDT`)
      );
    });
  } else {
    console.log(cyan.bold("Không có tiền đâu bé ơi..."));
  }
};

// default
const mainLoopMutil = async () => {
  eligibleAccounts.length = 0;
  while (true) {
    await runMulti();
    await countdown(timeRerun * 60);
  }
};

mainLoopMutil();
