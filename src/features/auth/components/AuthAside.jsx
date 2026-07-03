import fraudVisual from "../../../assets/fraud-visual.png";

function AuthAside() {
  return (
    <aside
      className="
        hidden
        lg:flex
        h-screen
        bg-[#292929]
        text-white
      "
    >
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
        "
      >
        <div
          className="
            w-[720px]
            -translate-x-8
          "
        >
          {/* Welcome */}
          <div>
            <h1
              className="
                text-[56px]
                font-bold
                leading-[64px]
                tracking-[-0.02em]
              "
            >
              Welcome Back to FRMS !
            </h1>

            <div className="mt-6 h-[3px] w-[150px] bg-white" />
          </div>

          {/* Text */}
          <div className="mt-14">
            <h2
              className="
                text-[34px]
                font-semibold
                leading-[42px]
              "
            >
              Detect Fraud Before It Happens
            </h2>

            <p
              className="
                mt-6
                w-[600px]
                text-[20px]
                leading-[34px]
                text-white/80
              "
            >
              Sign in to access fraud alerts, transaction insights,
              risk scores and investigation tools from one secure
              dashboard.
            </p>
          </div>

          {/* Illustration */}
          <div className="mt-16">
            <img
              src={fraudVisual}
              alt="Fraud Dashboard"
              className="
                w-[700px]
                object-contain
                drop-shadow-[0_28px_70px_rgba(0,0,0,0.38)]
                select-none
              "
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AuthAside;