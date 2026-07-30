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
            w-[420px]
            -translate-x-8
          "
        >
          {/* Welcome */}
          <div>
            <h1
              className="
                text-[28px]
                font-bold
                leading-[32px]
                tracking-[-0.02em]
              "
            >
              Welcome Back to FRMS !
            </h1>

            <div className="mt-4 h-[3px] w-[150px] bg-white" />
          </div>

          {/* Text */}
          <div className="mt-4">
            <h2
              className="
                text-[22px]
                font-semibold
                leading-[32px]
              "
            >
              Detect Fraud Before It Happens
            </h2>

            <p
              className="
                mt-1
                w-[500px]
                text-[14px]
                leading-[20px]
                text-white/80
              "
            >
              Sign in to access fraud alerts, transaction insights,
              risk scores and investigation tools from one secure
              dashboard.
            </p>
          </div>

          {/* Illustration */}
          <div className="mt-10">
            <img
              src={fraudVisual}
              alt="Fraud Dashboard"
              className="
                w-[380px]
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
