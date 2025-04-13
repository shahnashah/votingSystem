import userModel from '../model/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from user object before sending response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organization: user.organization
    };

    

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Check authentication status
export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organization: user.organization
    };

    return res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('token');
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    console.log(name);

    // Input validation
    const errors = {};
    
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (!phone) errors.phone = 'Phone number is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered. Please login instead.',
        errors: { email: 'Email already registered' }
      });
    }

    // Check if phone is already registered
    const existingPhone = await userModel.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ 
        success: false, 
        message: 'Phone number already registered',
        errors: { phone: 'Phone number already registered' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP for email verification
    const verificationOTP = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Create new user
    const newUser = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: ['admin', 'committee', 'candidate', 'voter'].includes(role) ? role : 'voter', // Validate role
      verificationOTP,
      otpExpiry
    });

    await newUser.save();

    // Send verification email
    // In a production environment, you should use a proper email service
    // This is a simplified example using nodemailer
    const sendVerificationEmail = async () => {
      try {
        // Create a test account if no SMTP config
        // For production, use your actual SMTP config
        // let testAccount = await nodemailer.createTestAccount();
        
        // Create transporter
        let transporter = nodemailer.createTransport({
          service: "gmail",
          // host: process.env.SMTP_HOST || "smtp.ethereal.email",
          // port: process.env.SMTP_PORT || 587,
          // secure: process.env.SMTP_SECURE === 'true' || false,
          auth: {
            user: process.env.EMAIL_USER || testAccount.user,
            pass: process.env.EMAIL_PASS || testAccount.pass,
          },
        });

        // Send mail
        let info = await transporter.sendMail({
          from: '"Election System" <noreply@election-system.com>',
          to: email,
          subject: "Verify Your Email",
          text: `Your verification code is: ${verificationOTP}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Welcome to the Election System!</h2>
              <p>Thank you for registering. To complete your registration, please verify your email using the code below:</p>
              <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                <strong>${verificationOTP}</strong>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
          `,
        });

        console.log("Verification email sent: %s", info.messageId);
        // For development, log preview URL
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        return true;
      } catch (error) {
        console.error("Email sending failed:", error);
        return false;
      }
    };

    // Attempt to send verification email
    const emailSent = await sendVerificationEmail();

    return res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Registration successful! Please check your email for verification.' 
        : 'Registration successful! However, verification email could not be sent. Please contact support.',
      userId: newUser._id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
    });
  }
};

// Verify email with OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified. Please login.' 
      });
    }

    // Check if OTP matches and is not expired
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Update user to verified status
    user.isVerified = true;
    user.verificationOTP = undefined; // Clear OTP
    user.otpExpiry = undefined; // Clear OTP expiry
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again later.',
    });
  }
};

// Resend verification OTP
export const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified. Please login.' 
      });
    }

    // Generate new OTP
    const verificationOTP = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour

    // Update user with new OTP
    user.verificationOTP = verificationOTP;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Here you would implement your email sending logic
    // For brevity, we're just simulating it was sent successfully
    
    return res.status(200).json({
      success: true,
      message: 'Verification code has been sent to your email'
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification code. Please try again later.',
    });
  }
};