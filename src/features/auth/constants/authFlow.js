export const AUTH_STEPS = {
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgotPassword',
  NEW_PASSWORD: 'newPassword',
  OTP_VERIFICATION: 'otpVerification',
  LOGOUT: 'logout',
}

export const AUTH_STEP_CONTENT = {
  [AUTH_STEPS.LOGIN]: {
    title: 'Login',
    subtitle: 'Protect Every Transaction. Prevent Every Threat.',
  },
  [AUTH_STEPS.FORGOT_PASSWORD]: {
    eyebrow: 'Password recovery',
    title: 'Reset your password',
    subtitle: 'Enter your registered email and we will send a verification code.',
  },
  [AUTH_STEPS.OTP_VERIFICATION]: {
    eyebrow: 'Verification',
    title: 'Enter security code',
    subtitle: 'Use the 6-digit code sent to your registered email address.',
  },
  [AUTH_STEPS.LOGOUT]: {
    eyebrow: 'Signed out',
    title: 'You have been logged out',
    subtitle: 'Your Secure Edge session has ended. Sign in again to continue.',
  },
}

export const RISK_SIGNAL_CARDS = ['Identity', 'Velocity', 'Risk']
