/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require("request");

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request("https://api.ipify.org?format=json", (error, response, body) => {
    if (error) {
      return callback(error);
    }

    if (response.statusCode === 200) {
      const data = JSON.parse(body);

      try {
        callback(null, data.ip);
      } catch (e) {
        callback("Unable to fetch your IP address", null);
      }
    } else {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      return callback(Error(msg), null);
    }
  });
};

/**
 * Makes a single API request to retrieve the lat/lng for a given IPv4 address.
 * Input:
 *   - The ip (ipv4) address (string)
 *   - A callback (to pass back an error or the lat/lng object)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The lat and lng as an object (null if error). Example:
 *     { latitude: '49.27670', longitude: '-123.13000' }
 */

const fetchCoordsByIP = function(ip, callback) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    if (error) {
      return callback(error);
    }

    if (response.statusCode === 200) {
      const data = JSON.parse(body);

      if (data.success) {
        callback(null, { latitude: data.latitude, longitude: data.longitude });
      } else {
        callback(`Error: ${data.message}`, null);
      }
    } else {
      const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
      return callback(Error(msg), null);
    }
  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */

const fetchISSFlyOverTimes = function(coords, callback) {
  const { latitude: lat, longitude: lon } = coords;

  request(
    `https://iss-flyover.herokuapp.com/json/?lat=${lat}&lon=${lon}`,
    (error, response, body) => {
      if (error) {
        return callback(error);
      }

      if (response.statusCode === 200) {
        const data = JSON.parse(body);

        if (data.message === "success") {
          callback(null, data.response);
        } else {
          callback(`Error: failed to fetch floyover times`, null);
        }
      } else {
        const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
        return callback(Error(msg), null);
      }
    }
  );
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(`It didn't work! ${error}`, null);
    }

    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        return callback(`It didn't work! ${error}`, null);
      }

      fetchISSFlyOverTimes(coordinates, (error, times) => {
        if (error) {
          return callback(`It didn't work! ${error}`, null);
        }

        callback(null, times);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };
