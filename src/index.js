const server = require("./server");

const port = 5100;
process.on("exit", function () {
  console.log("db disconnected");
  mongoose.disconnect();
});
server
  .create()
  .then((app) => {
    app.listen(port, () => {
      console.log(`Server has started on port ${port}!`);
    });
  })
  .catch((err) => console.log(err));
