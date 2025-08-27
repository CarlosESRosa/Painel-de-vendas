import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface DatePickerProps {
  value?: { start: string; end: string } | undefined;
  onChange: (dateRange: { start: string; end: string } | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface DateRange {
  start: string;
  end: string;
}

const DatePicker = ({ value, onChange, label, placeholder, className = '' }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar com value externo
  useEffect(() => {
    setSelectedRange(value);
    setTempRange(value);
  }, [value]);

  // Função auxiliar para criar datas com precisão - usando local date strings para evitar timezone issues
  const createDateRange = (startDate: Date, endDate: Date) => {
    // Garantir que as datas sejam criadas corretamente no timezone local
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Definir horários para evitar problemas de fuso horário
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Usar toLocaleDateString para criar strings de data locais (YYYY-MM-DD)
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      start: formatDate(start),
      end: formatDate(end),
    };
  };

  // Opções de data rápida
  const quickDateOptions = [
    {
      label: 'HOJE',
      getRange: () => {
        const today = new Date();
        // Criar data no timezone local para evitar problemas
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        const startDate = new Date(year, month, day, 0, 0, 0, 0);
        const endDate = new Date(year, month, day, 23, 59, 59, 999);

        return createDateRange(startDate, endDate);
      },
    },
    {
      label: 'ESSA SEMANA',
      getRange: () => {
        const today = new Date();
        // Domingo = 0, Segunda = 1, ..., Sábado = 6
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return createDateRange(startOfWeek, endOfWeek);
      },
    },
    {
      label: 'ESSE MÊS',
      getRange: () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Primeiro dia do mês atual (1º do mês)
        const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);

        // Último dia do mês atual (último dia do mês)
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        return createDateRange(startOfMonth, endOfMonth);
      },
    },
    {
      label: 'MÊS PASSADO',
      getRange: () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Primeiro dia do mês passado
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);

        // Último dia do mês passado
        const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        return createDateRange(startOfLastMonth, endOfLastMonth);
      },
    },
    {
      label: 'ESSE ANO',
      getRange: () => {
        const today = new Date();
        const currentYear = today.getFullYear();

        // Primeiro dia do ano
        const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);

        // Último dia do ano
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        return createDateRange(startOfYear, endOfYear);
      },
    },
  ];

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Adicionar dias do mês anterior para completar a primeira semana
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Adicionar dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // Adicionar dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const handleQuickDateSelect = (option: (typeof quickDateOptions)[0]) => {
    const range = option.getRange();
    setTempRange(range);
    setSelectedRange(range);
    onChange(range);
    setIsOpen(false);
  };

  const handleDateClick = (date: Date) => {
    // Usar toLocaleDateString para criar string de data local (YYYY-MM-DD)
    const dateStr = date.toLocaleDateString('en-CA');

    if (!tempRange) {
      // Primeira seleção - definir início e fim como a mesma data
      const newRange = { start: dateStr, end: dateStr };
      setTempRange(newRange);
    } else if (tempRange.start === tempRange.end) {
      // Segunda seleção - criar o intervalo
      let newRange: { start: string; end: string };

      if (dateStr < tempRange.start) {
        // Data selecionada é anterior ao início
        newRange = { start: dateStr, end: tempRange.start };
      } else {
        // Data selecionada é posterior ao início
        newRange = { start: tempRange.start, end: dateStr };
      }

      setTempRange(newRange);
      setSelectedRange(newRange);
      onChange(newRange);
      setIsOpen(false);
    } else {
      // Nova seleção - resetar para uma nova data
      setTempRange({ start: dateStr, end: dateStr });
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isDateInRange = (date: Date) => {
    if (!tempRange) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr >= tempRange.start && dateStr <= tempRange.end;
  };

  const isDateStart = (date: Date) => {
    if (!tempRange) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr === tempRange.start;
  };

  const isDateEnd = (date: Date) => {
    if (!tempRange) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr === tempRange.end;
  };

  const formatDisplayValue = () => {
    if (!selectedRange) return placeholder || 'Selecione uma data';

    if (selectedRange.start === selectedRange.end) {
      // Converter string YYYY-MM-DD para Date e formatar para pt-BR
      const date = new Date(selectedRange.start + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    }

    // Converter strings YYYY-MM-DD para Date e formatar para pt-BR
    const startDate = new Date(selectedRange.start + 'T00:00:00').toLocaleDateString('pt-BR');
    const endDate = new Date(selectedRange.end + 'T00:00:00').toLocaleDateString('pt-BR');

    // Calcular quantos dias tem o intervalo
    const start = new Date(selectedRange.start + 'T00:00:00');
    const end = new Date(selectedRange.end + 'T00:00:00');
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return `${startDate} - ${endDate}`;
  };

  const clearSelection = () => {
    setSelectedRange(undefined);
    setTempRange(undefined);
    onChange(undefined);
    setIsOpen(false);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">{label}</label>
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
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                      <div key={day} className="text-xs text-secondary-500 text-center py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const dateStr = day.date.toLocaleDateString('en-CA');
                      const isInRange =
                        tempRange && dateStr >= tempRange.start && dateStr <= tempRange.end;
                      const isStart = tempRange && dateStr === tempRange.start;
                      const isEnd = tempRange && dateStr === tempRange.end;

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateClick(day.date)}
                          className={`
                                                        p-2 text-xs rounded transition-colors
                                                        ${
                                                          !day.isCurrentMonth
                                                            ? 'text-secondary-300'
                                                            : 'text-secondary-700 hover:bg-secondary-100'
                                                        }
                                                        ${
                                                          isInRange
                                                            ? 'bg-primary-100 text-primary-700'
                                                            : ''
                                                        }
                                                        ${
                                                          isStart
                                                            ? 'bg-primary-500 text-white font-semibold'
                                                            : ''
                                                        }
                                                        ${
                                                          isEnd
                                                            ? 'bg-primary-500 text-white font-semibold'
                                                            : ''
                                                        }
                                                    `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
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
  );
};

export default DatePicker;
