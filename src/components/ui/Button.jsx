function Button({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      className={`h-[58px] w-full rounded-xl bg-[#f50707] text-base font-bold text-white shadow-sm shadow-red-900/20 transition hover:bg-[#d90000] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[72px] sm:text-[22px] ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
