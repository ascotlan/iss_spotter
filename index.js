const { nextISSTimesForMyLocation } = require("./iss");

nextISSTimesForMyLocation((error, passTimes) => {
  if (error) {
    return console.log("It didn't work!", error);
  }
  // success, print out the deets!
  passTimes.forEach((time) => {
    const date = new Date(time.risetime);
    const msg = `Next pass at ${date} for ${time.duration} seconds!`;
    console.log(msg);
  });
});
