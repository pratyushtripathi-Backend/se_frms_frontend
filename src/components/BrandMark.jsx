import secureLogo from '../assets/secure-logo.png'

function BrandMark({ compact = false }) {
  return (
    <img
      alt="Secure Edge Fintech Pvt. Ltd."
      className={
        compact
          ? 'h-auto w-[210px] sm:w-[250px]'
          : 'h-auto w-[240px] max-w-full sm:w-[320px] lg:w-[410px]'
      }
      src={secureLogo}
    />
  )
}

export default BrandMark
