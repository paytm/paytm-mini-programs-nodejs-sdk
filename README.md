# Paytm Miniapps Node Client SDK 

A node client SDK to interact with Paytm's miniapps ecosystem

## Requirements

Make sure nodejs version **8.17.0 or above** is installed. To check current node version, run
```sh
node -v
```

## Getting Started

* To use it in your code, include following lines in your **package.json**

```javascript
"dependencies": {
    ...
    "paytm-mini-programs-nodejs-sdk": "https://github.com/paytm/paytm-mini-programs-nodejs-sdk.git"
    ...
}
```

* Install with npm:

```sh
npm install paytm-mini-programs-nodejs-sdk
```

## Usage

### Auth Client

* Configuring Auth client

```javascript

const miniAppsClientSdk = require('paytm-mini-programs-nodejs-sdk');
const OauthClient = miniAppsClientSdk.clients.oauth;
const oauthClient = new OauthClient({
    clientId : "<Auth Client ID received on onboarding>"
    clientSecret : "<Auth Client Secret received on onboarding>"
},{
    ENDPOINT : "https://accounts.paytm.com",
    TIMEOUT : 10 * 1000
});

```

* An example of fetch access token

```javascript

(async function() {
    try {
        const requestOpts = {
            code : "<Auth code received from trust login>"
        };
        const response = await oauthClient.oauthToken(requestOpts);
        console.log('Here is oauth token response', JSON.stringify(response));
    } catch(err) {
        console.log('Some error occurred while fetching oauth token', err);
    }
}());

```

* An example of User Profile

```javascript

(async function() {
    try {
        const requestOpts = {
            scopeCode : "<received from fetch access token api response: access_token>"
        };
        const response = await oauthClient.userProfile(requestOpts);
        console.log('Here is user profile response', JSON.stringify(response));
    } catch(err) {
        console.log('Some error occurred while fetching user profile', err);
    }
}());

```


### Miniapps Common Client

* Configuring Common Client

```javascript

const miniAppsClientSdk = require('paytm-mini-programs-nodejs-sdk');
const MiniAppsCommonClient = miniAppsClientSdk.clients.common;
const commonClient = new MiniAppsCommonClient({
    clientId : "<Auth Client ID received on onboarding>"
},{
    ENDPOINT : "https://miniapps.paytm.com",
    TIMEOUT : 10 * 1000
});

```

* An example of fetch open id

```javascript

(async function() {
    try {
        const sso_token = "<received from fetch access token api response: access_token>";
        const response = await commonClient.getPartnerOpenId(sso_token);
        console.log('Here is partner open id response', JSON.stringify(response));
    } catch(err) {
        console.log('Some error occurred while fetching open id', err);
    }
}());

```

* An example of send notification

```javascript

(async function() {
    try {
        const payload = {
            name : "<name>",
            vertical : "<vertical>",
            url : "<url>"
        };

        const requestObject = {
            access_token : "<received from fetch access token: access_token>",
            mid : "<merchant mid received on onboarding>",
            openId : "<received from fetch open id>",
            orderId : "<paytm order id received after placing order>",
            templateName : "<notification template name received on onboarding>",
            notificationPayload : payload
        };
        
        const response = await commonClient.sendPartnerNotification(requestObject);
        console.log('Here is send partner notification response', JSON.stringify(response));
    } catch(err) {
        console.log('Some error occurred while sending partner notification', err);
    }
}());

```

## Development

### Getting Started

* Clone this repository
```sh
git clone https://github.com/paytm/paytm-mini-programs-nodejs-sdk.git
```

* Install dependencies
```sh
npm install
```

### Documentation

To generate complete documentation, run

```sh
npm run docs
```

Open the generated document via **./docs/\<repository name\>/\<version\>/index.html**

### Debugging

To view debug logs for this client, run your app with the environment variable **DEBUG=miniapps.node.***
```sh
DEBUG=miniapps.node.* NODE_ENV=staging node app.js
```

### Unit Test Cases

To run unit test cases for this client, use following command :
```sh
npm test
```

### Code Coverage

To generate code coverage for test cases, use following command :
```sh
npm run coverage
```

Open the generated document via **./coverage/index.html**