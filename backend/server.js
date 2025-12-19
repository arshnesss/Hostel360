  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const dotenv = require("dotenv");

  dotenv.config();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' })); 
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.json());

  // Routes imports
  const adminRoutes = require("./routes/adminRoutes");

  // Test route
  app.get("/", (req, res) => {
    res.send("Backend is running!");
  });

  // Routes

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/complaints", require("./routes/complaintRoutes"));
  app.use("/api/admin", adminRoutes);

  // Connect MongoDB
  const startServer = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected!");

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}!!`)
      );
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  };

  startServer();
