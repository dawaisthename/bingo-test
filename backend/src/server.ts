import express from "express";
import cors from "cors";
import routes from "./routes/routes";

const app = express();

app.use(express.json());

const corsOptions = {
  credentials: true,
  methods: "GET,PUT,POST,DELETE",
  origin:true
};

app.use(cors(corsOptions));

app.use("/api", routes);
const port = 9000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
