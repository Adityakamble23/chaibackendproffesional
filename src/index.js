import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectdb from "./db/index.js";
import { app } from "./app.js";

connectdb()
  .then(() => {
    // app.on(error, (err) => {
    //   console.log("APP LEVEL ERROR from index.js", err);
    // });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(
      "MONGO CONNECTION ERROR check for that error is from index.js ",
      error
    );
  });
