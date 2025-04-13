import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model.js"; // ✅ double-check this path
import connectDB from "../config/db.js";

dotenv.config();
await connectDB();

const createAdmin = async () => {
  const email = "admin@example.com";
  const plainPassword = "Shahna@123";

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log("Admin already exists!");
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await Admin.create({
    email,
    password: hashedPassword,
  });

  console.log("✅ Admin created successfully");
  process.exit();
};

createAdmin();
