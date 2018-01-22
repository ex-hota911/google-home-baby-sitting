#!/usr/bin/env node
'use strict';

const DashButton = require('dash-button');
const GoogleHome = require('google-home-notifier');

if (process.argv.length < 3) {
	console.log("Usage: node index.js $DASH_BUTTON_MAC_ADDRESS");
	console.log("  You can get the address by running 'npm scan'");
	process.exit(1);
}
const DASH_BUTTON_MAC_ADDRESS = process.argv[2];

const button = new DashButton(DASH_BUTTON_MAC_ADDRESS);

GoogleHome.device('Google Home', 'ja');  // or "Chromecast"
GoogleHome.accent('jp');
GoogleHome.notify('お風呂呼び出しシステムが起動しました。', (res) => {
	console.log(res);
});

button.addListener(() => {
	GoogleHome.notify('ピピピ。お風呂で呼んでいます。'.repeat(4), (res) => {
  	console.log(res);
	});
});

console.log('Waiting...');
