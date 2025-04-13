import Admin from "../model/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

  export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const adminSignup = async (req, res) => {

  try {
    const {email, password } = req.body;

    if(!email || !password) {
      return res.json({
        success: false,
        message: "missing details"
      })
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    const adminData = {
      email, password:hashedPassword
    }

    const newAdmin =  new Admin(adminData);

    const admin = await newAdmin.save();

    res.json({
      success: true,
      message: "admin created successfully",
      admin: admin.email
    })

    
  } catch (error) {
    console.log(error);
  }
}

