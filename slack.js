#!/usr/bin/env node
'use strict';

const GoogleHome = require('google-home-notifier');
const { RtmClient, CLIENT_EVENTS, WebClient, RTM_EVENTS } = require('@slack/client');

// An access token (from your Slack app or custom integration - usually xoxb)
const SLACK_TOKEN = process.env.SLACK_TOKEN;
if (!SLACK_TOKEN) {
	console.log("SLACK_TOKEN is missing");
	process.exit(1);
}

const CHANNEL_NAME = process.env.CHANNEL_NAME || 'notify';

// Initialize slack
const appData = {};

// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(SLACK_TOKEN, {
  dataStore: false,
  useRtmConnect: true,
	//logLevel: 'debug',
});

// The client will emit an RTM.AUTHENTICATED event on when the connection data is avaiable
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
  // Cache the data necessary for this app in memory
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

// Need a web client to find a channel where the app can post a message
const web = new WebClient(SLACK_TOKEN);

let channelId = '';
web.channels.list().then((channels) => {
	console.log("Fetched channels") ;
	for (let ch of channels.channels) {
		if (ch.name == CHANNEL_NAME) {
			console.log("Found the notify channel");
			channelId = ch.id;
			return;
		}
	}
});

// The client will emit an RTM.RTM_CONNECTION_OPEN the connection is ready for
// sending and recieving messages
// Start the connecting process
rtm.start();

GoogleHome.device('Google Home', 'ja');  // or "Chromecast"

const records = {};

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message);

  // Skip messages that are from a bot or my own user ID
  if ( (message.subtype && message.subtype === 'bot_message'
				&& message.username != 'IFTTT') ||
       (!message.subtype && message.user === appData.selfId) ) {
    return;
  }
	if (message.channel != channelId) {
		return;
	}

	let text = message.text || message.attachments[0].pretext;
	console.log(text);
	console.log(typeof text);
	text = text.replace(/\s/g, "")

	let mes = '';
	if (text.includes("寝た")) {
		records.startSleep = Date.now();
		console.log(records.startSleep);
		mes = "おやすみなさい";
	} else if (text.includes("起きた")) {
		records.finishSleep = Date.now();
		if (records.startSleep) {
			console.log(records.finishSleep);
			console.log(records.startSleep);
 			let min = Math.floor((records.finishSleep - records.startSleep) / 1000 / 60);
			if (min > 60) {
				let hour = Math.floor(min / 60);
				min =  min % 60;
				mes = hour + '時間' + min + '分寝ました';
			} else {
				mes = min + '分寝ました';
			}
		}
	} else if (text.includes("おむつ") || text.includes("オムツ") ) {
		if (records.change) {
			mes = "前回は" + Math.floor((Date.now() - records.change) / 60000) + "分前でした";
		}
		records.change = Date.now();
	} else if (text.includes("ミルク") || text.includes("授乳")) {
		if (records.milk) {
			mes = "前回は" + Math.floor((Date.now() - records.milk) / 60000) + "分前でした";
		}
		records.milk = Date.now();
	}

	if (mes) {
		GoogleHome.notify(mes, (res) => {
			console.log(res);
		});
	}
});
