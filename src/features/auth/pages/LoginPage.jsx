import AuthHeader from "../components/AuthHeader";
import LoginForm from "../components/LoginForm";
import { AUTH_STEP_CONTENT, AUTH_STEPS } from "../constants/authFlow";

function LoginPage({
  onForgotPassword,
  onLoginSuccess,
  onLogout,
}) {
  return (
    <section
  className="
    w-full
    max-w-[1290px]
    min-h-[700px]
    rounded-[40px]
    border
    border-[#E8E8E8]
    bg-white
    px-[80px]
    py-[64px]
    shadow-[0_24px_70px_rgba(0,0,0,0.12)]
    flex
    flex-col
  "
>
      <AuthHeader
        content={AUTH_STEP_CONTENT[AUTH_STEPS.LOGIN]}
      />

      <div className="mt-10">
        <LoginForm
          onForgotPassword={onForgotPassword}
          onLoginSuccess={onLoginSuccess}
        />
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="sr-only"
      >
        View logout state
      </button>
    </section>
  );
}

export default LoginPage;