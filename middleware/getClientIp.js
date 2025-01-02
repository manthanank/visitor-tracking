const requestIp = require("request-ip");

const getClientIp = (req, res, next) => {
  const clientIp = requestIp.getClientIp(req); // Automatically detects the client's IP
  req.clientIp = clientIp || "unknown"; // Add the IP address to the request object
  next();
};

module.exports = getClientIp;
