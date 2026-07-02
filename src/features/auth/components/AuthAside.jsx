import fraudVisual from '../../../assets/fraud-visual.png'

function AuthAside() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#292929] text-white lg:block">
      <div className="mx-auto max-w-[730px] px-[5%] pt-[14vh] xl:px-0 xl:pt-[167px]">
        <h1 className="h-auto w-full max-w-[399px] font-[Poppins] text-[32px] font-bold leading-none tracking-normal xl:h-12">
          Welcome Back to FRMS !
        </h1>
        <div className="mt-6 h-1 w-56 rounded-full bg-white" />

        <div className="mt-14 xl:mt-[72px]">
          <h2 className="text-2xl font-bold xl:text-[28px]">
            Detect Fraud Before It Happens
          </h2>
          <p className="mt-5 max-w-[640px] font-['Mona_Sans',Poppins,sans-serif] text-lg font-normal leading-none text-white xl:mt-[25px] xl:h-[46px] xl:w-[482px] xl:text-[16px]">
            Sign in to access fraud alerts, transaction insights, risk scores,
            and investigation tools from one secure dashboard.
          </p>
        </div>

        <img
          alt="Fraud alert and transaction risk chart"
          className="mt-16 rounded-[10px] bg-white xl:mt-[80px] xl:h-[423px] xl:w-[529px] xl:max-w-none"
          src={fraudVisual}
        />
      </div>
    </aside>
  )
}

export default AuthAside
