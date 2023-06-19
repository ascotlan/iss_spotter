const { nextISSTimesForMyLocation } = require("./iss_promised");

nextISSTimesForMyLocation()
  .then((times) => {
    // success, print out the deets!
    times.forEach((time) => {
      const date = new Date(time.risetime);
      const msg = `Next pass at ${date} for ${time.duration} seconds!`;
      console.log(msg);
    });
  })
  .catch((error) => {
    console.log("It didn't work: ", error.message);
  });
