function TextField({
  actionIcon: ActionIcon,
  icon: Icon,
  label,
  name,
  onActionClick,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  return (
    <label className="block">
      <span className="flex min-h-[58px] overflow-hidden rounded-xl border border-[#d8d8d8] bg-white transition focus-within:border-[#bdbdbd] focus-within:ring-4 focus-within:ring-red-100 sm:h-[72px]">
        <span className="flex w-[118px] shrink-0 items-center border-r border-[#d8d8d8] px-4 text-base font-bold text-black sm:w-[164px] sm:px-6 sm:text-xl lg:w-[202px] lg:px-8 lg:text-[22px]">
          <Icon className="mr-2 text-black sm:mr-3" size={22} strokeWidth={1.9} />
          {label}
        </span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent px-4 text-base font-medium text-black outline-none placeholder:text-[#b7b7b7] sm:px-6 sm:text-xl"
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {ActionIcon && (
          <button
            className="flex w-12 shrink-0 items-center justify-center text-black transition hover:text-[#ef1414] sm:w-16"
            onClick={onActionClick}
            type="button"
          >
            <ActionIcon size={24} strokeWidth={1.8} />
          </button>
        )}
      </span>
    </label>
  )
}

export default TextField
