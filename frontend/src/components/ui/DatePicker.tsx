import { useState, useRef, useEffect } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface DatePickerProps {
    value?: { start: string; end: string } | undefined
    onChange: (dateRange: { start: string; end: string } | undefined) => void
    label?: string
    placeholder?: string
    className?: string
}

interface DateRange {
    start: string
    end: string
}

const DatePicker = ({ value, onChange, label, placeholder, className = '' }: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value)
    const [tempRange, setTempRange] = useState<DateRange | undefined>(value)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fechar dropdown quando clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Sincronizar com value externo
    useEffect(() => {
        setSelectedRange(value)
        setTempRange(value)
    }, [value])

    // Opções de data rápida
    const quickDateOptions = [
        {
            label: 'HOJE',
            getRange: () => {
                const today = new Date()
                const dateStr = today.toISOString().split('T')[0]
                return { start: dateStr, end: dateStr }
            }
        },
        {
            label: 'ESSA SEMANA',
            getRange: () => {
                const today = new Date()
                const startOfWeek = new Date(today)
                startOfWeek.setDate(today.getDate() - today.getDay())
                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(startOfWeek.getDate() + 6)

                return {
                    start: startOfWeek.toISOString().split('T')[0],
                    end: endOfWeek.toISOString().split('T')[0]
                }
            }
        },
        {
            label: 'ESSE MÊS',
            getRange: () => {
                const today = new Date()
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

                return {
                    start: startOfMonth.toISOString().split('T')[0],
                    end: endOfMonth.toISOString().split('T')[0]
                }
            }
        },
        {
            label: 'MÊS PASSADO',
            getRange: () => {
                const today = new Date()
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

                return {
                    start: startOfLastMonth.toISOString().split('T')[0],
                    end: endOfLastMonth.toISOString().split('T')[0]
                }
            }
        },
        {
            label: 'ESSE ANO',
            getRange: () => {
                const today = new Date()
                const startOfYear = new Date(today.getFullYear(), 0, 1)
                const endOfYear = new Date(today.getFullYear(), 11, 31)

                return {
                    start: startOfYear.toISOString().split('T')[0],
                    end: endOfYear.toISOString().split('T')[0]
                }
            }
        }
    ]

    // Funções do calendário
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Adicionar dias do mês anterior para completar a primeira semana
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
            days.push({ date: prevDate, isCurrentMonth: false })
        }

        // Adicionar dias do mês atual
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i)
            days.push({ date: currentDate, isCurrentMonth: true })
        }

        // Adicionar dias do próximo mês para completar a última semana
        const remainingDays = 42 - days.length // 6 semanas * 7 dias
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i)
            days.push({ date: nextDate, isCurrentMonth: false })
        }

        return days
    }

    const handleQuickDateSelect = (option: typeof quickDateOptions[0]) => {
        const range = option.getRange()
        setTempRange(range)
        setSelectedRange(range)
        onChange(range)
        setIsOpen(false)
    }

    const handleDateClick = (date: Date) => {
        if (!tempRange) {
            const dateStr = date.toISOString().split('T')[0]
            setTempRange({ start: dateStr, end: dateStr })
        } else if (!tempRange.end || tempRange.start === tempRange.end) {
            const dateStr = date.toISOString().split('T')[0]
            const newRange = { start: tempRange.start, end: dateStr }

            // Garantir que start seja menor que end
            if (newRange.start > newRange.end) {
                [newRange.start, newRange.end] = [newRange.end, newRange.start]
            }

            setTempRange(newRange)
            setSelectedRange(newRange)
            onChange(newRange)
            setIsOpen(false)
        } else {
            const dateStr = date.toISOString().split('T')[0]
            setTempRange({ start: dateStr, end: dateStr })
        }
    }

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            if (direction === 'prev') {
                newMonth.setMonth(prev.getMonth() - 1)
            } else {
                newMonth.setMonth(prev.getMonth() + 1)
            }
            return newMonth
        })
    }

    const isDateInRange = (date: Date) => {
        if (!tempRange) return false
        const dateStr = date.toISOString().split('T')[0]
        return dateStr >= tempRange.start && dateStr <= tempRange.end
    }

    const isDateStart = (date: Date) => {
        if (!tempRange) return false
        const dateStr = date.toISOString().split('T')[0]
        return dateStr === tempRange.start
    }

    const isDateEnd = (date: Date) => {
        if (!tempRange) return false
        const dateStr = date.toISOString().split('T')[0]
        return dateStr === tempRange.end
    }

    const formatDisplayValue = () => {
        if (!selectedRange) return placeholder || 'Selecione uma data'

        if (selectedRange.start === selectedRange.end) {
            return new Date(selectedRange.start).toLocaleDateString('pt-BR')
        }

        return `${new Date(selectedRange.start).toLocaleDateString('pt-BR')} - ${new Date(selectedRange.end).toLocaleDateString('pt-BR')}`
    }

    const clearSelection = () => {
        setSelectedRange(undefined)
        setTempRange(undefined)
        onChange(undefined)
        setIsOpen(false)
    }

    const days = getDaysInMonth(currentMonth)
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 gap-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-inner-tech flex items-center justify-start"
                >
                    <CalendarIcon className="h-5 w-5 text-secondary-400" />
                    <span className={selectedRange ? 'text-secondary-900' : 'text-secondary-500'}>
                        {formatDisplayValue()}
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-[600px] bg-white border border-secondary-200 rounded-xl shadow-soft">
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Opções rápidas */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-secondary-700 mb-3">Seleção Rápida</h3>
                                    {quickDateOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickDateSelect(option)}
                                            className="w-full px-3 py-2 text-sm text-secondary-700 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 rounded-lg transition-colors text-left"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Calendário */}
                                <div>
                                    <h3 className="text-sm font-medium text-secondary-700 mb-3">Seleção Manual</h3>

                                    {/* Header do calendário */}
                                    <div className="flex items-center justify-between mb-3">
                                        <button
                                            onClick={() => handleMonthChange('prev')}
                                            className="p-1 hover:bg-secondary-100 rounded"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4 text-secondary-600" />
                                        </button>

                                        <span className="text-sm font-medium text-secondary-900">
                                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </span>

                                        <button
                                            onClick={() => handleMonthChange('next')}
                                            className="p-1 hover:bg-secondary-100 rounded"
                                        >
                                            <ChevronRightIcon className="h-4 w-4 text-secondary-600" />
                                        </button>
                                    </div>

                                    {/* Dias da semana */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                            <div key={day} className="text-xs text-secondary-500 text-center py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dias do mês */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {days.map((day, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleDateClick(day.date)}
                                                className={`
                                                    p-2 text-xs rounded transition-colors
                                                    ${!day.isCurrentMonth ? 'text-secondary-300' : 'text-secondary-700 hover:bg-secondary-100'}
                                                    ${isDateInRange(day.date) ? 'bg-primary-100 text-primary-700' : ''}
                                                    ${isDateStart(day.date) ? 'bg-primary-500 text-white' : ''}
                                                    ${isDateEnd(day.date) ? 'bg-primary-500 text-white' : ''}
                                                `}
                                            >
                                                {day.date.getDate()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Botões de ação */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-secondary-200">
                                <button
                                    onClick={clearSelection}
                                    className="text-sm text-secondary-600 hover:text-secondary-800"
                                >
                                    Limpar
                                </button>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-2 text-sm text-secondary-600 hover:text-secondary-800"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DatePicker
