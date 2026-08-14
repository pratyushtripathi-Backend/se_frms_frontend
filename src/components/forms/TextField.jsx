function TextField({
  actionIcon: ActionIcon,
  compact = false,
  icon: Icon,
  label,
  name,
  onActionClick,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  const fieldShellClass = compact
    ? 'flex min-h-[48px] overflow-hidden rounded-[8px] border border-[#d8d8d8] bg-white transition focus-within:border-[#bdbdbd] focus-within:ring-4 focus-within:ring-red-100 sm:h-[50px]'
    : 'flex min-h-[48px] overflow-hidden rounded-xl border border-[#d8d8d8] bg-white transition focus-within:border-[#bdbdbd] focus-within:ring-4 focus-within:ring-red-100 sm:h-[72px]'
  const labelClass = compact
    ? 'flex w-[104px] shrink-0 items-center border-r border-[#d8d8d8] px-4 text-sm font-semibold text-black sm:w-[124px] sm:px-5 sm:text-[15px]'
    : 'flex w-[118px] shrink-0 items-center border-r border-[#d8d8d8] px-4 text-base font-semibold text-black sm:w-[164px] sm:px-6 sm:text-xl lg:w-[202px] lg:px-8 lg:text-[20px]'
  const passwordInputClass = type === 'password' ? 'frms-password-input' : ''
  const inputClass = compact
    ? `min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-normal text-black outline-none placeholder:text-[#b7b7b7] sm:px-5 sm:text-[14px] ${passwordInputClass}`
    : `min-w-0 flex-1 border-0 bg-transparent px-4 text-base font-small text-black outline-none placeholder:text-[#b7b7b7] sm:px-6 sm:text-medium ${passwordInputClass}`
  const actionClass = compact
    ? 'flex w-11 shrink-0 items-center justify-center text-black transition hover:text-[#ef1414] sm:w-14'
    : 'flex w-12 shrink-0 items-center justify-center text-black transition hover:text-[#ef1414] sm:w-16'

  return (
    <label className="block">
      <span className={fieldShellClass}>
        <span className={labelClass}>
          <Icon className="mr-2 text-black sm:mr-3" size={compact ? 20 : 22} strokeWidth={1.9} />
          {label}
        </span>
        <input
          className={inputClass}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {ActionIcon && (
          <button
            className={actionClass}
            onClick={onActionClick}
            type="button"
          >
            <ActionIcon size={compact ? 22 : 24} strokeWidth={1.8} />
          </button>
        )}
      </span>
    </label>
  )
}

export default TextField
