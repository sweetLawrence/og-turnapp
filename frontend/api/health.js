module.exports = function handler(request, response) {
  response.status(200).json({
    status: "healthy",
    service: "turnapp-ui",
    timestamp: new Date().toISOString(),
  });
};
