import React, { useState, useEffect, useRef } from 'react'
import {
  Filter,
  RotateCcw,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react'
import PlantApi from '@/features/lms/services/PlantApi'
import DepartmentApi from '@/features/lms/services/DepartmentApi'
import SubDepartmentApi from '@/features/lms/services/SubDepartmentApi'
import LinesApi from '@/features/lms/services/LinesApi'
import MachinesApi from '@/features/lms/services/MachinesApi'

const DEFAULT_FILTERS = {
  plant: '',
  department: '',
  subDepartment: '',
  line: '',
  machine: '',
  shift: '',
  date: '',
  startDate: '',
  endDate: '',
  fromDate: '',
  toDate: '',
}

const DEFAULT_SHIFTS = [
  { id: 'Shift A', name: 'Shift A' },
  { id: 'Shift B', name: 'Shift B' },
  { id: 'Shift C', name: 'Shift C' },
  { id: 'General', name: 'General Shift' },
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const formatDateISO = (d) => {
  if (!d || Number.isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateISO = (str) => {
  if (!str || typeof str !== 'string') return null
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

// Normalizes API responses (arrays or wrapped { data / items / results }) into { id, name, ...raw }
const normalizeList = (data, nameKeys = ['name']) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
          ? data.results
          : []

  return list
    .map((item) => {
      if (!item) return null
      if (typeof item === 'string') {
        const trimmed = item.trim()
        return trimmed ? { id: trimmed, name: trimmed, raw: item } : null
      }
      const id =
        item.id ??
        item.plantId ??
        item.departmentId ??
        item.subDepartmentId ??
        item.lineId ??
        item.machineId ??
        item._id

      let name = ''
      for (const k of nameKeys) {
        if (item[k]) {
          name = String(item[k]).trim()
          break
        }
      }
      if (!name && id != null) name = `ID #${id}`
      if (!name) return null

      return {
        id: id ?? name,
        name,
        raw: item,
      }
    })
    .filter(Boolean)
}

// Helper to resolve the correct select value matching option ID or Name
const getActiveSelectValue = (currentVal, options) => {
  if (!currentVal && currentVal !== 0) return ''
  if (!Array.isArray(options) || options.length === 0) return currentVal
  const match = options.find((opt) => {
    if (typeof opt === 'string') return opt === currentVal
    return (
      String(opt?.id) === String(currentVal) ||
      opt?.name === currentVal ||
      opt?.value === currentVal
    )
  })
  if (match) {
    return typeof match === 'string'
      ? match
      : match?.id ?? match?.value ?? match?.name ?? currentVal
  }
  return currentVal
}

const EMPTY_OPTIONS = Object.freeze([])

export default function Filters({
  // Dashboard interface
  filters: propFilters,
  onFilterChange,
  onResetFilters,

  // LMS interface (for components using values/onChange)
  values: propValues,
  onChange,

  // Explicit dropdown options (optional overrides from parent)
  plantOptions = EMPTY_OPTIONS,
  departmentOptions = EMPTY_OPTIONS,
  subDepartmentOptions = EMPTY_OPTIONS,
  lineOptions = EMPTY_OPTIONS,
  machineOptions = EMPTY_OPTIONS,
  shiftOptions = EMPTY_OPTIONS,
}) {
  // Internal fallback state when rendered uncontrolled (e.g. <Filters /> without props)
  const [internalFilters, setInternalFilters] = useState(DEFAULT_FILTERS)

  // Resolve current active filters
  const currentFilters = propFilters || propValues || internalFilters

  // Dynamic dropdown state from backend APIs
  const [plants, setPlants] = useState([])
  const [departments, setDepartments] = useState([])
  const [subDepartments, setSubDepartments] = useState([])
  const [lines, setLines] = useState([])
  const [machines, setMachines] = useState([])

  // Keep latest state in refs so dependent effects don't re-trigger when lists update
  const plantsRef = useRef(plants)
  const departmentsRef = useRef(departments)
  const subDepartmentsRef = useRef(subDepartments)
  const linesRef = useRef(lines)

  useEffect(() => {
    plantsRef.current = plants
  }, [plants])

  useEffect(() => {
    departmentsRef.current = departments
  }, [departments])

  useEffect(() => {
    subDepartmentsRef.current = subDepartments
  }, [subDepartments])

  useEffect(() => {
    linesRef.current = lines
  }, [lines])

  // Stable boolean flags for whether custom options were provided by parent
  const hasCustomPlantOptions = Boolean(plantOptions && plantOptions.length > 0)
  const hasCustomDeptOptions = Boolean(
    departmentOptions && departmentOptions.length > 0
  )
  const hasCustomSubDeptOptions = Boolean(
    subDepartmentOptions && subDepartmentOptions.length > 0
  )
  const hasCustomLineOptions = Boolean(lineOptions && lineOptions.length > 0)
  const hasCustomMachineOptions = Boolean(
    machineOptions && machineOptions.length > 0
  )

  // Loading states
  const [loading, setLoading] = useState({
    plant: false,
    department: false,
    subDepartment: false,
    line: false,
    machine: false,
  })

  // Error states
  const [errors, setErrors] = useState({
    plant: null,
    department: null,
    subDepartment: null,
    line: null,
    machine: null,
  })

  // Resolve current active start and end dates from currentFilters
  const startDate =
    currentFilters.startDate ||
    currentFilters.fromDate ||
    (typeof currentFilters.date === 'string' &&
    currentFilters.date.includes(' to ')
      ? currentFilters.date.split(' to ')[0]
      : currentFilters.date || '')

  const endDate =
    currentFilters.endDate ||
    currentFilters.toDate ||
    (typeof currentFilters.date === 'string' &&
    currentFilters.date.includes(' to ')
      ? currentFilters.date.split(' to ')[1]
      : '')

  // Date Range Popover & Selection States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(startDate)
  const [draftEnd, setDraftEnd] = useState(endDate)
  const [activeRangeField, setActiveRangeField] = useState('from') // 'from' | 'to'
  const [hoverDate, setHoverDate] = useState(null)
  const datePickerRef = useRef(null)

  // Calendar month navigation: defaults to startDate's month or current month
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const parsed = parseDateISO(startDate)
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
  })

  const handleToggleDatePicker = () => {
    if (!isDatePickerOpen) {
      setDraftStart(startDate)
      setDraftEnd(endDate)
      if (startDate) {
        const parsed = parseDateISO(startDate)
        if (parsed && !Number.isNaN(parsed.getTime())) {
          setCurrentMonthDate(parsed)
        }
      }
    }
    setIsDatePickerOpen((prev) => !prev)
  }

  // Click outside and ESC key listener to dismiss calendar popover
  useEffect(() => {
    if (!isDatePickerOpen) return

    const handleOutsideClick = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsDatePickerOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDatePickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDatePickerOpen])

  // Determine effective option lists (props override dynamic if provided non-empty)
  const effectivePlantOptions = hasCustomPlantOptions ? plantOptions : plants
  const effectiveDepartmentOptions = hasCustomDeptOptions
    ? departmentOptions
    : departments
  const effectiveSubDepartmentOptions = hasCustomSubDeptOptions
    ? subDepartmentOptions
    : !currentFilters.department
      ? EMPTY_OPTIONS
      : subDepartments
  const effectiveLineOptions = hasCustomLineOptions
    ? lineOptions
    : !currentFilters.subDepartment
      ? EMPTY_OPTIONS
      : lines
  const effectiveMachineOptions = hasCustomMachineOptions
    ? machineOptions
    : !currentFilters.line
      ? EMPTY_OPTIONS
      : machines
  const effectiveShiftOptions =
    shiftOptions?.length > 0 ? shiftOptions : DEFAULT_SHIFTS

  // Track initial department fetch to avoid redundant requests on mount
  const hasLoadedAllDeptsRef = useRef(false)

  /* ===================== 1. FETCH PLANTS ===================== */
  useEffect(() => {
    if (hasCustomPlantOptions) return

    const controller = new AbortController()
    let isMounted = true

    const fetchPlants = async () => {
      setLoading((prev) => ({ ...prev, plant: true }))
      setErrors((prev) => ({ ...prev, plant: null }))
      try {
        const res = await PlantApi.getPlants({ signal: controller.signal })
        if (!isMounted) return
        const normalized = normalizeList(res?.data ?? res, [
          'plantLocation',
          'plantName',
          'name',
          'plant_name',
        ])
        setPlants(normalized)
      } catch (err) {
        if (
          !isMounted ||
          controller.signal.aborted ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return
        }
        console.error('Failed to load plants in Filters:', err)
        setErrors((prev) => ({ ...prev, plant: 'Failed to load plants' }))
        setPlants([])
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, plant: false }))
        }
      }
    }

    fetchPlants()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [hasCustomPlantOptions])

  /* ===================== 2. FETCH DEPARTMENTS (DEPENDENT ON PLANT) ===================== */
  useEffect(() => {
    if (hasCustomDeptOptions) return

    // If no plant is selected and all departments were already fetched once, skip redundant reload
    if (!currentFilters.plant && hasLoadedAllDeptsRef.current) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    const fetchDepartments = async () => {
      setLoading((prev) => ({ ...prev, department: true }))
      setErrors((prev) => ({ ...prev, department: null }))
      try {
        let res
        if (currentFilters.plant) {
          const plantList = plantsRef.current || []
          const plantObj = plantList.find(
            (p) =>
              String(p.id) === String(currentFilters.plant) ||
              p.name === currentFilters.plant
          )
          const resolvedPlantId = plantObj ? plantObj.id : currentFilters.plant

          try {
            res = await PlantApi.getDepartmentsByPlant(resolvedPlantId, {
              signal: controller.signal,
            })
          } catch {
            if (controller.signal.aborted) return
            // Fallback to all departments if plant-specific endpoint fails
            res = await DepartmentApi.getDepartments({
              signal: controller.signal,
            })
          }
        } else {
          res = await DepartmentApi.getDepartments({
            signal: controller.signal,
          })
          hasLoadedAllDeptsRef.current = true
        }

        if (!isMounted) return
        const normalized = normalizeList(res?.data ?? res, [
          'departmentName',
          'name',
          'department_name',
        ])
        setDepartments(normalized)
      } catch (err) {
        if (
          !isMounted ||
          controller.signal.aborted ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return
        }
        console.error('Failed to load departments in Filters:', err)
        setErrors((prev) => ({
          ...prev,
          department: 'Failed to load departments',
        }))
        setDepartments([])
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, department: false }))
        }
      }
    }

    fetchDepartments()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentFilters.plant, hasCustomDeptOptions])

  /* ===================== 3. FETCH SUB-DEPARTMENTS (DEPENDENT ON DEPARTMENT) ===================== */
  useEffect(() => {
    if (hasCustomSubDeptOptions || !currentFilters.department) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    const fetchSubDepartments = async () => {
      setLoading((prev) => ({ ...prev, subDepartment: true }))
      setErrors((prev) => ({ ...prev, subDepartment: null }))
      try {
        const deptList = departmentsRef.current || []
        const deptObj = deptList.find(
          (d) =>
            String(d.id) === String(currentFilters.department) ||
            d.name === currentFilters.department
        )
        const resolvedDeptId = deptObj ? deptObj.id : currentFilters.department

        const res =
          await SubDepartmentApi.getSubDepartmentsByDepartment(resolvedDeptId, {
            signal: controller.signal,
          })
        if (!isMounted) return
        const normalized = normalizeList(res?.data ?? res, [
          'subDepartmentName',
          'name',
          'sub_department_name',
        ])
        setSubDepartments(normalized)
      } catch (err) {
        if (
          !isMounted ||
          controller.signal.aborted ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return
        }
        console.error('Failed to load sub-departments in Filters:', err)
        setErrors((prev) => ({
          ...prev,
          subDepartment: 'Failed to load sub-departments',
        }))
        setSubDepartments([])
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, subDepartment: false }))
        }
      }
    }

    fetchSubDepartments()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentFilters.department, hasCustomSubDeptOptions])

  /* ===================== 4. FETCH LINES (DEPENDENT ON SUB-DEPARTMENT) ===================== */
  useEffect(() => {
    if (hasCustomLineOptions || !currentFilters.subDepartment) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    const fetchLines = async () => {
      setLoading((prev) => ({ ...prev, line: true }))
      setErrors((prev) => ({ ...prev, line: null }))
      try {
        const subDeptList = subDepartmentsRef.current || []
        const subDeptObj = subDeptList.find(
          (s) =>
            String(s.id) === String(currentFilters.subDepartment) ||
            s.name === currentFilters.subDepartment
        )
        const resolvedSubDeptId = subDeptObj
          ? subDeptObj.id
          : currentFilters.subDepartment

        const res = await LinesApi.getLinesBySubDepartment(resolvedSubDeptId, {
          signal: controller.signal,
        })
        if (!isMounted) return
        const normalized = normalizeList(res?.data ?? res, [
          'lineName',
          'name',
          'line_name',
        ])
        setLines(normalized)
      } catch (err) {
        if (
          !isMounted ||
          controller.signal.aborted ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return
        }
        console.error('Failed to load lines in Filters:', err)
        setErrors((prev) => ({ ...prev, line: 'Failed to load lines' }))
        setLines([])
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, line: false }))
        }
      }
    }

    fetchLines()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentFilters.subDepartment, hasCustomLineOptions])

  /* ===================== 5. FETCH MACHINES (DEPENDENT ON LINE) ===================== */
  useEffect(() => {
    if (hasCustomMachineOptions || !currentFilters.line) {
      return
    }

    const controller = new AbortController()
    let isMounted = true

    const fetchMachines = async () => {
      setLoading((prev) => ({ ...prev, machine: true }))
      setErrors((prev) => ({ ...prev, machine: null }))
      try {
        const lineList = linesRef.current || []
        const lineObj = lineList.find(
          (l) =>
            String(l.id) === String(currentFilters.line) ||
            l.name === currentFilters.line
        )
        const resolvedLineId = lineObj ? lineObj.id : currentFilters.line

        const res = await MachinesApi.getMachinesByLine(resolvedLineId, {
          signal: controller.signal,
        })
        if (!isMounted) return
        const normalized = normalizeList(res?.data ?? res, [
          'machineName',
          'name',
          'machine_name',
        ])
        setMachines(normalized)
      } catch (err) {
        if (
          !isMounted ||
          controller.signal.aborted ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return
        }
        console.error('Failed to load machines in Filters:', err)
        setErrors((prev) => ({ ...prev, machine: 'Failed to load machines' }))
        setMachines([])
      } finally {
        if (isMounted) {
          setLoading((prev) => ({ ...prev, machine: false }))
        }
      }
    }

    fetchMachines()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [currentFilters.line, hasCustomMachineOptions])

  /* ===================== CASCADING CHANGE HANDLER ===================== */
  const handleFieldChange = (key, value) => {
    // Determine child fields to reset upon selecting a parent filter
    let clearedFields = {}
    if (key === 'plant') {
      clearedFields = {
        department: '',
        subDepartment: '',
        line: '',
        machine: '',
      }
    } else if (key === 'department') {
      clearedFields = {
        subDepartment: '',
        line: '',
        machine: '',
      }
    } else if (key === 'subDepartment') {
      clearedFields = {
        line: '',
        machine: '',
      }
    } else if (key === 'line') {
      clearedFields = {
        machine: '',
      }
    }

    const updatedFilters = {
      ...currentFilters,
      [key]: value,
      ...clearedFields,
    }

    // 1. Dashboard callback: onFilterChange(key, value)
    if (onFilterChange) {
      onFilterChange(key, value)
      Object.entries(clearedFields).forEach(([clearedKey, clearedVal]) => {
        onFilterChange(clearedKey, clearedVal)
      })
    }

    // 2. LMS callback: onChange(updatedValuesObject)
    if (onChange) {
      onChange(updatedFilters)
    }

    // 3. Update internal state if not controlled by Dashboard filters
    if (!propFilters) {
      setInternalFilters(updatedFilters)
    }
  }

  /* ===================== DATE RANGE PICKER HANDLERS ===================== */
  const emitDateRangeChange = (newStart, newEnd) => {
    const formattedRange =
      newStart && newEnd
        ? `${newStart} to ${newEnd}`
        : newStart || ''

    if (onFilterChange) {
      onFilterChange('startDate', newStart)
      onFilterChange('endDate', newEnd)
      onFilterChange('fromDate', newStart)
      onFilterChange('toDate', newEnd)
      onFilterChange('date', formattedRange)
    }

    const updated = {
      ...currentFilters,
      startDate: newStart,
      endDate: newEnd,
      fromDate: newStart,
      toDate: newEnd,
      date: formattedRange,
    }

    if (onChange) {
      onChange(updated)
    }

    if (!propFilters) {
      setInternalFilters(updated)
    }
  }

  const handleClearDateRange = () => {
    setDraftStart('')
    setDraftEnd('')
    emitDateRangeChange('', '')
    setIsDatePickerOpen(false)
  }

  const handleApplyDateRange = () => {
    let finalStart = draftStart
    let finalEnd = draftEnd

    // If only one date is picked, fill both or handle gracefully
    if (finalStart && !finalEnd) {
      finalEnd = finalStart
    } else if (!finalStart && finalEnd) {
      finalStart = finalEnd
    }

    // Requirement 5: Do not allow To Date to be earlier than From Date
    if (finalStart && finalEnd && finalEnd < finalStart) {
      finalEnd = finalStart
    }

    setDraftStart(finalStart)
    setDraftEnd(finalEnd)
    emitDateRangeChange(finalStart, finalEnd)
    setIsDatePickerOpen(false)
  }

  const handleDaySelect = (dayStr) => {
    if (activeRangeField === 'from') {
      setDraftStart(dayStr)
      // Requirement 6: If From Date changes to a date later than selected To Date, handle To Date appropriately
      if (draftEnd && dayStr > draftEnd) {
        setDraftEnd(dayStr)
      }
      setActiveRangeField('to')
    } else {
      // activeRangeField === 'to'
      // Requirement 5: Do not allow To Date to be earlier than From Date
      if (!draftStart || dayStr < draftStart) {
        setDraftStart(dayStr)
        setActiveRangeField('to')
      } else {
        setDraftEnd(dayStr)
        setActiveRangeField('from')
      }
    }
  }

  const applyPreset = (presetType) => {
    const today = new Date()
    let startD = new Date()
    let endD = new Date()

    if (presetType === 'today') {
      startD = today
      endD = today
    } else if (presetType === 'last7') {
      startD = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
      endD = today
    } else if (presetType === 'thisMonth') {
      startD = new Date(today.getFullYear(), today.getMonth(), 1)
      endD = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    } else if (presetType === 'last30') {
      startD = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
      endD = today
    }

    const newStart = formatDateISO(startD)
    const newEnd = formatDateISO(endD)

    setDraftStart(newStart)
    setDraftEnd(newEnd)
    setCurrentMonthDate(startD)
    emitDateRangeChange(newStart, newEnd)
    setIsDatePickerOpen(false)
  }

  // Month calculations for side-by-side rendering
  const leftYear = currentMonthDate.getFullYear()
  const leftMonth = currentMonthDate.getMonth()
  const rightMonthDate = new Date(leftYear, leftMonth + 1, 1)
  const rightYear = rightMonthDate.getFullYear()
  const rightMonth = rightMonthDate.getMonth()

  const renderMonthCalendar = (year, month, isLeftCalendar) => {
    const numDays = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const todayStr = formatDateISO(new Date())

    const days = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div
          key={`blank-${year}-${month}-${i}`}
          className="h-7 w-7 sm:h-8 sm:w-8"
        />
      )
    }

    for (let day = 1; day <= numDays; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const isStart = draftStart === dayStr
      const isEnd = draftEnd === dayStr
      const isInRange =
        draftStart && draftEnd && dayStr > draftStart && dayStr < draftEnd
      const isHovered =
        draftStart &&
        !draftEnd &&
        hoverDate &&
        dayStr > draftStart &&
        dayStr <= hoverDate
      const isToday = dayStr === todayStr

      let cellBg = ''
      let cellText = 'text-slate-700 hover:bg-slate-100'
      let rounded = 'rounded-md'

      if (isStart && isEnd) {
        cellBg = 'bg-[#0b295c] text-white font-bold'
        cellText = 'text-white'
        rounded = 'rounded-md'
      } else if (isStart) {
        cellBg = 'bg-[#0b295c] text-white font-bold'
        cellText = 'text-white'
        rounded = draftEnd ? 'rounded-l-md rounded-r-none' : 'rounded-md'
      } else if (isEnd) {
        cellBg = 'bg-[#0b295c] text-white font-bold'
        cellText = 'text-white'
        rounded = 'rounded-r-md rounded-l-none'
      } else if (isInRange) {
        cellBg = 'bg-[#e0f2fe]'
        cellText = 'text-[#0284c7] font-semibold'
        rounded = 'rounded-none'
      } else if (isHovered) {
        cellBg = 'bg-sky-50'
        cellText = 'text-sky-700'
        rounded = 'rounded-none'
      }

      days.push(
        <button
          key={dayStr}
          type="button"
          onClick={() => handleDaySelect(dayStr)}
          onMouseEnter={() => {
            if (draftStart && !draftEnd) {
              setHoverDate(dayStr)
            }
          }}
          className={`h-7 w-7 sm:h-8 sm:w-8 text-[11px] sm:text-xs flex items-center justify-center transition-all cursor-pointer select-none relative ${cellBg} ${cellText} ${rounded} ${
            isToday && !isStart && !isEnd
              ? 'font-bold underline decoration-sky-500 underline-offset-2'
              : ''
          }`}
        >
          {day}
        </button>
      )
    }

    return (
      <div className="flex-1 min-w-[210px]">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          {isLeftCalendar ? (
            <button
              type="button"
              onClick={() =>
                setCurrentMonthDate(
                  new Date(
                    currentMonthDate.getFullYear(),
                    currentMonthDate.getMonth() - 1,
                    1
                  )
                )
              }
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="text-xs font-bold text-slate-800">
            {MONTH_NAMES[month]} {year}
          </div>

          {!isLeftCalendar ? (
            <button
              type="button"
              onClick={() =>
                setCurrentMonthDate(
                  new Date(
                    currentMonthDate.getFullYear(),
                    currentMonthDate.getMonth() + 1,
                    1
                  )
                )
              }
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <span
              key={d}
              className="text-[10px] font-semibold text-slate-400 py-0.5"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-0.5 text-center">{days}</div>
      </div>
    )
  }

  /* ===================== UNIFIED RESET HANDLER ===================== */
  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters()
    }

    if (onChange) {
      onChange(DEFAULT_FILTERS)
    }

    setInternalFilters(DEFAULT_FILTERS)
    setDraftStart('')
    setDraftEnd('')
    setIsDatePickerOpen(false)
    setSubDepartments([])
    setLines([])
    setMachines([])
  }

  // Render dropdown options (supports strings, { id, name }, or { label, value })
  const renderOptions = (options) => {
    if (!Array.isArray(options) || options.length === 0) return null

    return options.map((opt, idx) => {
      const val =
        typeof opt === 'string'
          ? opt
          : opt?.id ?? opt?.value ?? opt?.name ?? ''
      const label =
        typeof opt === 'string'
          ? opt
          : opt?.name ?? opt?.label ?? opt?.id ?? ''
      return (
        <option key={opt?.id ?? idx} value={val}>
          {label}
        </option>
      )
    })
  }

  // Determine disabled states for dependent dropdowns
  const isSubDeptDisabled =
    !subDepartmentOptions?.length &&
    (!currentFilters.department || loading.subDepartment)
  const isLineDisabled =
    !lineOptions?.length && (!currentFilters.subDepartment || loading.line)
  const isMachineDisabled =
    !machineOptions?.length && (!currentFilters.line || loading.machine)

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs p-3 sm:p-3.5 mb-4 select-none">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filters
          </span>
        </div>
        <button
          onClick={handleReset}
          type="button"
          className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-sky-600 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 items-end">
        {/* 1. Plant */}
        <div className="min-w-0">
          <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            <span>Plant</span>
            {loading.plant && (
              <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
            )}
          </label>
          <select
            value={getActiveSelectValue(
              currentFilters.plant,
              effectivePlantOptions
            )}
            onChange={(e) => handleFieldChange('plant', e.target.value)}
            disabled={loading.plant}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {loading.plant
                ? 'Loading Plants...'
                : errors.plant
                  ? 'Failed to load plants'
                  : 'All Plants'}
            </option>
            {renderOptions(effectivePlantOptions)}
          </select>
        </div>

        {/* 2. Department (dependent on Plant, if applicable) */}
        <div className="min-w-0">
          <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            <span>Department</span>
            {loading.department && (
              <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
            )}
          </label>
          <select
            value={getActiveSelectValue(
              currentFilters.department,
              effectiveDepartmentOptions
            )}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            disabled={loading.department}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {loading.department
                ? 'Loading Departments...'
                : errors.department
                  ? 'Failed to load departments'
                  : 'All Departments'}
            </option>
            {renderOptions(effectiveDepartmentOptions)}
          </select>
        </div>

        {/* 3. Sub-department (dependent on Department) */}
        <div className="min-w-0">
          <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            <span>Sub-department</span>
            {loading.subDepartment && (
              <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
            )}
          </label>
          <select
            value={getActiveSelectValue(
              currentFilters.subDepartment,
              effectiveSubDepartmentOptions
            )}
            onChange={(e) => handleFieldChange('subDepartment', e.target.value)}
            disabled={isSubDeptDisabled}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {loading.subDepartment
                ? 'Loading Sub-depts...'
                : !currentFilters.department &&
                    !subDepartmentOptions?.length
                  ? 'Select Dept first'
                  : errors.subDepartment
                    ? 'Failed to load sub-depts'
                    : 'All Sub-depts'}
            </option>
            {renderOptions(effectiveSubDepartmentOptions)}
          </select>
        </div>

        {/* 4. Line (dependent on Sub-department) */}
        <div className="min-w-0">
          <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            <span>Line</span>
            {loading.line && (
              <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
            )}
          </label>
          <select
            value={getActiveSelectValue(
              currentFilters.line,
              effectiveLineOptions
            )}
            onChange={(e) => handleFieldChange('line', e.target.value)}
            disabled={isLineDisabled}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {loading.line
                ? 'Loading Lines...'
                : !currentFilters.subDepartment && !lineOptions?.length
                  ? 'Select Sub-dept first'
                  : errors.line
                    ? 'Failed to load lines'
                    : 'All Lines'}
            </option>
            {renderOptions(effectiveLineOptions)}
          </select>
        </div>

        {/* 5. Machine (dependent on Line) */}
        <div className="min-w-0">
          <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            <span>Machine</span>
            {loading.machine && (
              <Loader2 className="w-3 h-3 text-sky-600 animate-spin" />
            )}
          </label>
          <select
            value={getActiveSelectValue(
              currentFilters.machine,
              effectiveMachineOptions
            )}
            onChange={(e) => handleFieldChange('machine', e.target.value)}
            disabled={isMachineDisabled}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {loading.machine
                ? 'Loading Machines...'
                : !currentFilters.line && !machineOptions?.length
                  ? 'Select Line first'
                  : errors.machine
                    ? 'Failed to load machines'
                    : 'All Machines'}
            </option>
            {renderOptions(effectiveMachineOptions)}
          </select>
        </div>

        {/* 6. Shift */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Shift
          </label>
          <select
            value={currentFilters.shift || ''}
            onChange={(e) => handleFieldChange('shift', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md py-1.5 px-2 text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1.5 focus:ring-sky-500 transition-all cursor-pointer h-[32px] min-w-0"
          >
            <option value="">All Shifts</option>
            {renderOptions(effectiveShiftOptions)}
          </select>
        </div>

        {/* 7. Date Range (with Dual Calendars) */}
        <div
          className="col-span-2 sm:col-span-1 min-w-0 relative"
          ref={datePickerRef}
        >
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-tight truncate">
            Date Range
          </label>
          <div
            onClick={handleToggleDatePicker}
            className={`w-full flex items-center justify-between text-xs bg-slate-50 border ${
              isDatePickerOpen
                ? 'border-sky-500 ring-1.5 ring-sky-500 bg-white'
                : 'border-slate-200 hover:border-slate-300'
            } rounded-md py-1.5 px-2 text-slate-700 transition-all cursor-pointer h-[32px] min-w-0 select-none`}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isDatePickerOpen}
          >
            <div className="flex items-center space-x-1.5 min-w-0 flex-1 truncate">
              <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              {startDate || endDate ? (
                <div className="flex items-center space-x-1 text-[11px] font-medium text-slate-800 truncate">
                  <span className="truncate">{startDate || 'From'}</span>
                  <span className="text-slate-400 font-bold text-[10px]">
                    →
                  </span>
                  <span className="truncate">{endDate || 'To'}</span>
                </div>
              ) : (
                <span className="text-slate-400 text-xs truncate">
                  From - To
                </span>
              )}
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearDateRange()
                }}
                className="p-0.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded transition-colors"
                title="Clear date range"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* TWO-CALENDAR DATE RANGE POPOVER */}
          {isDatePickerOpen && (
            <div
              className="absolute top-[calc(100%+6px)] right-0 z-50 bg-white rounded-xl shadow-2xl border border-slate-200/90 p-3 sm:p-4 w-[92vw] sm:w-[520px] md:w-[560px] select-none animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setHoverDate(null)}
            >
              {/* Popover Top: Selected From & To Badges */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  {/* From Date Box */}
                  <div
                    onClick={() => setActiveRangeField('from')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      activeRangeField === 'from'
                        ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-1 ring-sky-500/50 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      From Date
                    </div>
                    <div className="truncate font-mono">
                      {draftStart || 'Select start date'}
                    </div>
                  </div>

                  <span className="text-slate-300 font-bold text-xs">→</span>

                  {/* To Date Box */}
                  <div
                    onClick={() => setActiveRangeField('to')}
                    className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      activeRangeField === 'to'
                        ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-1 ring-sky-500/50 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      To Date
                    </div>
                    <div className="truncate font-mono">
                      {draftEnd || 'Select end date'}
                    </div>
                  </div>
                </div>

                {/* Preset shortcuts on mobile/desktop */}
                <div className="flex items-center space-x-1 overflow-x-auto text-[11px] font-medium text-slate-500">
                  <button
                    type="button"
                    onClick={() => applyPreset('today')}
                    className="px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('last7')}
                    className="px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    7D
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('thisMonth')}
                    className="px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('last30')}
                    className="px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    30D
                  </button>
                </div>
              </div>

              {/* Two Calendars Side by Side */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pb-3">
                {renderMonthCalendar(leftYear, leftMonth, true)}
                <div className="hidden sm:block w-px bg-slate-100" />
                {renderMonthCalendar(rightYear, rightMonth, false)}
              </div>

              {/* Popover Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearDateRange}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Range
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyDateRange}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0b295c] hover:bg-[#082046] shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
