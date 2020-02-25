# LogViewer
Log analyzer application

## How to build

1. Git clone this repository
```bash
git clone https://github.com/Fluf22/LogViewer.git
```

2. Make sure you have Node.JS 10.x and npm installed on your PC ([node website](https://nodejs.org/))
```bash
node -v
npm -v
```

3. From the cloned repository, launch
```bash
npm install
npm run electron-dist
```

4. It will create a build for your PC's OS in the `dist` directory

5. Enjoy!

## TODOs:

* Use node's `watchFile` electron-side to send data dynamically
* Filter the log details table by column
* Switch between local time and UTC in the table date column
* Languages
* Add more data visualisation with Victory
