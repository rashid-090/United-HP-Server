require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Add it back when communicating with react
const logger = require("morgan");
const { Server } = require("socket.io");
const http = require("http")
const mongoose = require("mongoose");


const app = express();

// Mounting necessary middlewares.
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Setting up cors
const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

};


app.use(cors(corsOptions));

// Create an HTTP server to handle requests
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:7000',
//     methods: ['GET', 'POST']
//   }
// });

app.use(express.json());
app.use(logger("dev"));


// // Socket.IO Setup
// io.on('connection', (socket) => {
//   console.log('A user connected');
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });


// // Middleware to emit events
// app.use((req, res, next) => {

//   req.io = io; // Attach `io` instance to `req` for emitting events
//   next();
// });

// const adminRoutes = require("./routes/admin");
const superAdminRoutes = require("./routes/superAdmin");
const authRoutes = require("./routes/auth");
const userRoutes = require('./routes/user');
const dealerRoutes = require('./routes/dealer');
const { authenticateUser } = require("./middleware/authMiddleware");



// test route
app.get("/api/test", (req, res) => { res.status(200).json({ data: "test route success" }) });

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/dealer", authenticateUser, dealerRoutes);



// Handle socket connections




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening on Port: ${process.env.PORT} - DB Connected`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
