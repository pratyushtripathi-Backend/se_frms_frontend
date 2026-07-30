import secureLogo from '../assets/secure-logo.png'

function BrandMark({ compact = false }) {
  return (
    <img
      alt="Secure Edge Fintech Pvt. Ltd."
      className={
        compact
          ? 'h-auto w-[240px] max-w-90 sm:w-[220px] -mt-4'
          : 'h-auto w-[240px] max-w-90 sm:w-[320px] lg:w-[240px] -mt-4'
      }
      src={secureLogo}
    />
  )
}

export default BrandMark
