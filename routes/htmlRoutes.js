var path = require("path");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "../app/Public/index.html"));
  });

  app.get("/livechat", function(req, res) {
    console.log("livechat");
    res.sendFile(path.join(__dirname, "../app/Public/livechat.html"));
  });
};
