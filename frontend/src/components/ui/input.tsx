import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 hover:bg-white hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
