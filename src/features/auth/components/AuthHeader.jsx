function AuthHeader({ compact = false, content }) {
  return (
    <>
      {content.eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ef1414]">
          {content.eyebrow}
        </p>
      )}
      <h2
        className={`font-black leading-tight tracking-[-0.02em] text-black ${
          compact
            ? "text-3xl sm:text-[20px] lg:text-[22px]"
            : "text-3xl sm:text-[26px] lg:text-[28px]"
        }`}
      >
        {content.title}
      </h2>
      <p
        className={`font-medium text-[#767676] ${
          compact
            ? "mt-2 text-base leading-6 sm:text-lg lg:text-[14px]"
            : "mt-2 text-base leading-7 sm:mt-6 sm:text-xl lg:mt-7 lg:text-[16px]"
        }`}
      >
        {content.subtitle}
      </p>
    </>
  )
}

export default AuthHeader
