import { forwardRef, type InputHTMLAttributes } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: 'search' | 'none'
    variant?: 'default' | 'search'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon = 'none', variant = 'default', className = '', ...props }, ref) => {
        const baseClasses = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
        const variantClasses = {
            default: "border-secondary-300 focus:ring-primary-500 focus:border-transparent bg-white shadow-inner-tech",
            search: "border-secondary-300 focus:ring-primary-500 focus:border-transparent bg-white shadow-soft pl-11"
        }
        const errorClasses = error ? "border-danger-300 focus:ring-danger-500" : ""

        const inputClasses = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon === 'search' && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={inputClasses}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1 text-sm text-danger-600">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
