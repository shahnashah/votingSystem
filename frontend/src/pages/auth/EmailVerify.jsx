import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Try to get email from location state (passed from registration page)
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  useEffect(() => {
    // Countdown timer for resend button
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);

  const handleOtpChange = (e) => {
    // Allow only numbers and limit to 6 digits
    const value = e.target.value.replace(/[^\d]/g, "").substring(0, 6);
    setOtp(value);
    if (error) setError("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/api/auth/verify-email`,
        {
          email,
          otp,
        }
      );

      setSuccessMessage(
        response.data.message || "Email verified successfully!"
      );

      // Redirect to login page after successful verification
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setResendDisabled(true);

    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/api/auth/resend-verification`,
        {
          email,
        }
      );

      setSuccessMessage(
        response.data.message || "Verification code has been resent"
      );
      setCountdown(60); // Disable resend for 60 seconds
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
      setResendDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to your email
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="example@email.com"
              />
            </div>

            {/* OTP Field */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={handleOtpChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1 tracking-widest text-center"
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || resendDisabled}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium focus:outline-none"
            >
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : "Didn't receive a code? Resend"}
            </button>

            <div className="text-center mt-4">
              <a
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Back to login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
