import AuthHeader from "../components/AuthHeader";
import LoginForm from "../components/LoginForm";
import { AUTH_STEP_CONTENT, AUTH_STEPS } from "../constants/authFlow";

function LoginPage({
  notice = '',
  onForgotPassword,
  onLoginSuccess,
  onLogout,
}) {
  return (
    <section
  className="
    w-full
    max-w-[1290px]
    rounded-[32px]
    border
    border-[#E8E8E8]
    bg-white
    px-[58px]
    py-[58px]
    shadow-[0_24px_70px_rgba(0,0,0,0.12)]
    flex
    flex-col
  "
>
      <AuthHeader
        compact
        content={AUTH_STEP_CONTENT[AUTH_STEPS.LOGIN]}
      />

      <div className="mt-7">
        {notice && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-[#d90000]">
            {notice}
          </div>
        )}

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
