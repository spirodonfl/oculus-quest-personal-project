// Delete existing token
fetch("https://192.168.33.20:8000/api/tokens/F235DEB883E922CD8A5C63BA78D970E8F958D4158FEE2B430F3CACF4969A4A19", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-CA,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://192.168.33.20:8000/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "DELETE",
  "mode": "cors",
  "credentials": "omit"
});

// Must follow delete... I think
fetch("https://192.168.33.20:8000/api/tokens", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-CA,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://192.168.33.20:8000/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});

// LOGIN
fetch("https://192.168.33.20:8000/api/tokens", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-CA,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://192.168.33.20:8000/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "username=guacadmin&password=guacadmin",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});

// Get other details
fetch("https://192.168.33.20:8000/api/tokens", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-CA,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://192.168.33.20:8000/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "token=BD51A420DE740E925FFE99D4C2CA7589AE7241387F2F0C3B73C65BC1F9709E4C",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});

// Get connections
fetch("https://192.168.33.20:8000/api/session/data/postgresql/connectionGroups/ROOT/tree?token=BD51A420DE740E925FFE99D4C2CA7589AE7241387F2F0C3B73C65BC1F9709E4C", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-CA,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://192.168.33.20:8000/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
