# Setup

## dash-button

dash-button depends on libpcap:
```
# Ubuntu and Debian
sudo apt-get install libpcap-dev
# Fedora and CentOS
sudo yum install libpcap-devel
```

When you get "Permission denied" error,

```
sudo setcap 'cap_net_raw,cap_net_admin+eip' $(readlink -f $(which node))
```

https://github.com/stephenkeep/node-red-contrib-amazondash/issues/2
TODO: investigate why it fixes the issue.

## google-home-notifier

```
sudo apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
```

```
$ npm install
# Find the mac address of the dash button.
$ sudo npm run scan
# Specify the address found by the previous command.
$ npm start $MAC_ADDRESS
```
