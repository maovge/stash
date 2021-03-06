 // ðð®ð«ð ððð«ð¨ æºåºä¿¡æ¯
 // ðððï¼ https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Surge/Sub_info.js
 // ðð«ð¨ð¦ï¼https://raw.githubusercontent.com/mieqq/mieqq/master/sub_info.js
 // ðð©ððð­ðï¼2022.06.13 09:10
 
/*
Surgeéç½®åèæ³¨é,æè°¢@congcong.

ç¤ºä¾âââ 
----------------------------------------

[Proxy Group]
AmyInfo = select, policy-path=http://sub.info?url=æºåºèç¹é¾æ¥&reset_day=1&alert=1, update-interval=3600

[Script]
æºåºä¿¡æ¯ = type=http-request,pattern=http://sub\.info,script-path=https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Surge/Sub_info.js,timeout=10
----------------------------------------

èæ¬ä¸ç¨ä¿®æ¹ï¼ç´æ¥éç½®å°±å¥½ã

åå°å¸¦ææµéä¿¡æ¯çèç¹è®¢éé¾æ¥encodeï¼ç¨encodeåçé¾æ¥æ¿æ¢"url="åé¢ç[æºåºèç¹é¾æ¥]

å¯éåæ° &reset_dayï¼åé¢çæ°å­æ¿æ¢ææµéæ¯æéç½®çæ¥æï¼å¦1å·å°±å1ï¼8å·å°±å8ãå¦"&reset_day=8",ä¸å è¯¥åæ°ä¸æ¾ç¤ºæµééç½®ä¿¡æ¯ã

å¯éåæ° &expireï¼æºåºé¾æ¥ä¸å¸¦expireä¿¡æ¯çï¼å¯ä»¥æå¨ä¼ å¥expireåæ°ï¼å¦"&expire=2022-02-01",æ³¨æä¸å®è¦æç§yyyy-MM-ddçæ ¼å¼ã

å¯éåæ° &alertï¼æµéç¨éè¶è¿80%ãæµééç½®2å¤©åãæµééç½®ãå¥é¤å¿«å°æï¼è¿åç§æåµä¼åééç¥ï¼åæ°"title=xxx" å¯ä»¥èªå®ä¹éç¥çæ é¢ãå¦"&alert=1&title=AmyInfo",å¤ä¸ªæºåºä¿¡æ¯ï¼ä¸éè¦éç¥çæåµï¼ä¸å®è¦å  title åæ°ï¼ä¸ç¶éç¥å¤æ­ä¼åºç°é®é¢
----------------------------------------
*/

let now = new Date();
let today = now.getDate();
let month = now.getMonth();
let year = now.getFullYear();
let args = getArgs($request.url);
let resetDay = parseInt(args["due_day"] || args["reset_day"]);
let resetDayLeft = getRmainingDays(resetDay);

(async () => {
  let is_enhanced = await is_enhanced_mode();
  if (is_enhanced) await sleep(2000)
  let usage = await getDataInfo(args.url);
  if (!usage) {
    $done({})
    return;
  }
  let used = usage.download + usage.upload;
  let total = usage.total;
  let expire = usage.expire || args.expire;
  let localProxy = ['=http, localhost, 6152','=http, 127.0.0.1, 6152','=socks5,127.0.0.1, 6153']
  let infoList = [`${bytesToSize(used)} | ${bytesToSize(total)}`];

  if (resetDayLeft) {
    infoList.push(`æµééç½®ï¼å©ä½${resetDayLeft}å¤©`);
  }
  if (expire) {
    if (/^[\d.]+$/.test(expire)) expire *= 1000;
    infoList.push(`å¥é¤å°æï¼${formatTime(expire)}`);
  }
  sendNotification(used / total, expire, infoList);
  let body = infoList.map((item, index) => item+localProxy[index]).join("\n");
  $done({ response: { body } });
})();

function getArgs(url) {
  return Object.fromEntries(
    url
      .slice(url.indexOf("?") + 1)
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url };
  return new Promise((resolve, reject) =>
    $httpClient.head(request, (err, resp) => {
      if (err != null) {
        reject(err);
        return;
      }
      if (resp.status !== 200) {
        reject("Not Available");
        return;
      }
      let header = Object.keys(resp.headers).find(
        (key) => key.toLowerCase() === "subscription-userinfo"
      );
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("é¾æ¥ååºå¤´ä¸å¸¦ææµéä¿¡æ¯");
    })
  );
}

async function getDataInfo(url) {
  const [err, data] = await getUserInfo(url)
    .then((data) => [null, data])
    .catch((err) => [err, null]);
  if (err) {
    console.log(err);
    return;
  }

  return Object.fromEntries(
    data
      .match(/\w+=\d+/g)
      .map((item) => item.split("="))
      .map(([k, v]) => [k, parseInt(v)])
  );
}

function getRmainingDays(resetDay) {
  if (!resetDay) return 0;
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  if (resetDay > today) daysInMonth = 0;

  return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "å¹´" + month + "æ" + day + "æ¥";
}

function sendNotification(usageRate, expire, infoList) {
  if (!args.alert) return;
  let title = args.title || "Sub Info";
  let subtitle = infoList[0];
  let body = infoList.slice(1).join("\n");
  usageRate = usageRate * 100;

  if (resetDay <= today) month += 1;
  let resetTime = new Date(year, month, resetDay);
  //éç¥è®¡æ°å¨ï¼æ¯æéç½®æ¥éç½®
  let notifyCounter = JSON.parse($persistentStore.read(title) || "{}");
  if (!notifyCounter[resetTime]) {
    notifyCounter = {
      [resetTime]: { usageRate: 80, resetDayLeft: 3, expire: 31, resetDay: 1 },
    };
  }

  let count = notifyCounter[resetTime];

  if (usageRate > count.usageRate && resetDay != today) {
    $notification.post(
      `${title} | å©ä½æµéä¸è¶³${Math.ceil(100 - usageRate)}%`,
      subtitle,
      body
    );
    while (usageRate > count.usageRate) {
      if (count.usageRate < 95) {
        count.usageRate += 5;
      } else {
        count.usageRate += 4;
      }
    }
  }
  if (resetDayLeft && resetDayLeft < count.resetDayLeft && resetDay != today) {
    $notification.post(
      `${title} | æµéå°å¨${resetDayLeft}å¤©åéç½®`,
      subtitle,
      body
    );
    count.resetDayLeft = resetDayLeft;
  }
  if (resetDay == today && count.resetDay && usageRate < 5) {
    $notification.post(`${title} | æµéå·²éç½®`, subtitle, body);
    count.resetDay = 0;
  }
  if (expire) {
    let diff = (new Date(expire) - now) / (1000 * 3600 * 24);
    if (diff < count.expire) {
      $notification.post(
        `${title} | å¥é¤å©ä½æ¶é´ä¸è¶³${Math.ceil(diff)}å¤©`,
        subtitle,
        body
      );
      count.expire -= 5;
    }
  }
  $persistentStore.write(JSON.stringify(notifyCounter), title);
}

function is_enhanced_mode() {
  return new Promise((resolve) =>
    $httpAPI("GET", "v1/features/enhanced_mode", null, (data) => {
      resolve(data.enabled);
    })
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
