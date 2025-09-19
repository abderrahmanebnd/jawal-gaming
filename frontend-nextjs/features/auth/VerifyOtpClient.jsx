"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/routes";
import { useVerifyOtp } from "@/features/auth/useVerifyOtp";
import { useResendOtp } from "@/features/auth/useResendOtp";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [email, setEmail] = useState(null);
  const { mutate: verifyOtp,isPending:isLoading } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  const router = useRouter();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    if (!storedEmail) {
      router.replace(RoutePaths.login);
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      verifyOtp({ otp: enteredOtp, email });
    } else {
      alert("Please enter the full 6-digit OTP.");
    }
  };

  if (!email) return null; // wait until email is loaded

  return (
    <div className="otp-container">
      <div className="otp-box">
        <h2 className="otp-title">Verify OTP</h2>
        <p className="otp-subtitle">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="otp-input"
              />
            ))}
          </div>

          <button type="submit" className="otp-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="otp-resend">
            Didn’t get the code?{" "}
            <button
              type="button"
              className="otp-resend-link"
              disabled={isResending}
              onClick={() =>
                resendOtp(email, {
                  onSuccess: () => {
                    alert("OTP resent successfully!");
                  },
                })
              }
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
