function AuthHeader({ content }) {
  return (
    <>
      {content.eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ef1414]">
          {content.eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-black leading-tight tracking-[-0.02em] text-black sm:text-[38px] lg:text-[42px]">
        {content.title}
      </h2>
      <p className="mt-4 text-base font-medium leading-7 text-[#767676] sm:mt-6 sm:text-xl lg:mt-7 lg:text-[22px]">
        {content.subtitle}
      </p>
    </>
  )
}

export default AuthHeader
