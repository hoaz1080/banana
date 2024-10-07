import { green, yellow, red, blue, cyan } from "console-log-colors";
const url = "https://interface.carv.io/banana";

class NTD {
  constructor(stt, axiosInstance) {
    this.stt = stt;
    this.axios = axiosInstance;
  }

  login = async (queryData, ref_code) => {
    try {
      const headers = {};
      const payload = {
        tgInfo: queryData,
        InviteCode: ref_code,
      };
      const response = await this.axios.post(`${url}/login`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi login, vui lòng thử lại sau`, "warning");

      return null;
    }
  };

  getUserInfo = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };

      const response = await this.axios.get(
        `${url}/get_user_info`,

        {
          headers: headers,
        }
      );
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi userInfo, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  equipBestBanana = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };

      const response = await this.axios.get(`${url}/get_banana_list`, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi equipBestBanana, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  equipBanana = async (token, id) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = {
        bananaId: id,
      };
      const response = await this.axios.post(`${url}/do_equip`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data;
      }
    } catch (e) {
      this.log(`Lỗi equipBanana, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  getLotteryInfo = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };

      const response = await this.axios.get(`${url}/get_lottery_info`, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi getLotteryInfo, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  claimLottery = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = {
        claimLotteryType: 1,
      };
      const response = await this.axios.post(`${url}/claim_lottery`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data;
      }
    } catch (e) {
      this.log(`Lỗi claimLottery, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  doSpeedup = async (token, maxSpeedups = 3) => {
    let speedupsPerformed = 0;
    while (speedupsPerformed < maxSpeedups) {
      try {
        const headers = {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Authorization: `Bearer ${token}`,
        };
        const payload = {};
        const response = await this.axios.post(`${url}/do_speedup`, payload, {
          headers: headers,
        });
        if (response.data.code === 0) {
          const speedupCount = response.data.data.speedup_count;
          const lotteryInfo = response.data.data.lottery_info;
          speedupsPerformed++;
          this.log(
            `Speedup thành công! Còn lại ${speedupCount} lần speedup. Đã thực hiện ${speedupsPerformed}/${maxSpeedups} lần.`
          );

          if (lotteryInfo.countdown_end === true) {
            this.log("Countdown kết thúc. Đang claim lottery...");
            await this.claimLottery(token);
          }

          if (speedupCount === 0 || speedupsPerformed >= maxSpeedups) {
            this.log(
              `Đã hết lượt speedup hoặc đạt giới hạn ${maxSpeedups} lần.`
            );
            return lotteryInfo;
          }
        } else {
          this.log("Speedup thất bại!", "warning");
          return null;
        }
      } catch (e) {
        this.log(`Lỗi speedup, vui lòng thử lại sau`, "warning");
        return null;
      }
    }
  };
  doLottery = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = {};
      const response = await this.axios.post(`${url}/do_lottery`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi doLottery, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  doClick = async (token, clickCount) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = { clickCount: clickCount };
      const response = await this.axios.post(`${url}/do_click`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi doClick, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  getQuestList = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const response = await this.axios.get(`${url}/get_quest_list`, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi getQuestList, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  achieveQuest = async (token, id) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = { quest_id: id };
      const response = await this.axios.post(`${url}/achieve_quest`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi doClick, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  claimQuest = async (token, id) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = { quest_id: id };
      const response = await this.axios.post(`${url}/claim_quest`, payload, {
        headers: headers,
      });
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data.data;
      }
    } catch (e) {
      this.log(`Lỗi doClick, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  claimQuestLottery = async (token) => {
    try {
      const headers = {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      };
      const payload = {};
      const response = await this.axios.post(
        `${url}/claim_quest_lottery`,
        payload,
        {
          headers: headers,
        }
      );
      if (response && (response.status === 200 || response.status === 201)) {
        return response.data;
      }
    } catch (e) {
      this.log(`Lỗi claimQuestLottery, vui lòng thử lại sau`, "warning");
      return null;
    }
  };
  convertTime = (timestamp) => {
    const now = timestamp ? new Date(timestamp * 1000) : new Date(); // Multiply by 1000 if timestamp is in seconds
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Tháng bắt đầu từ 0
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
  };

  log = (message, type = "info") => {
    const timestamp = this.convertTime();
    let logMessage = `[${timestamp}] [🍁] Account ${this.stt} | ${message}`;

    switch (type) {
      case "process":
        console.log(yellow.bold(logMessage));
        break;
      case "success":
        console.log(green.bold(logMessage));
        break;
      case "error":
        console.log(red.bold(logMessage));
        break;
      case "already":
        console.log(blue.bold(logMessage));
        break;
      case "start":
        console.log(cyan.bold(logMessage));
        break;
      default:
        console.log(green.bold(logMessage));
        break;
      case "warning":
        console.log(yellow.bold(logMessage));
        break;
    }
  };
}

export default NTD;
