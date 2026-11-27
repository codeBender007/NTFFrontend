import React, { useState } from 'react'
import { ChevronDown, AlertOctagon, ShieldAlert } from 'lucide-react'
import DefectTrendChart from '../components/DefectTrendChart.jsx'
import AddMonthDataModal from '../components/AddMonthDataModal.jsx'

const MONTHS = [
  'Apr-25',
  'May-25',
  'Jun-25',
  'Jul-25',
  'Aug-25',
  'Sep-25',
  'Oct-25',
  'Nov-25',
  'Dec-25',
  'Jan-26',
  'Feb-26',
]

// Total Defects: In House Rejection target rises to 15 in Dec-25; Actual values: Dec=12, Jan=10, Feb=8
const INITIAL_IN_HOUSE_DATA = [
  { month: 'Apr-25', target: 0, actual: null },
  { month: 'May-25', target: 0, actual: null },
  { month: 'Jun-25', target: 0, actual: null },
  { month: 'Jul-25', target: 0, actual: null },
  { month: 'Aug-25', target: 0, actual: null },
  { month: 'Sep-25', target: 0, actual: null },
  { month: 'Oct-25', target: 0, actual: null },
  { month: 'Nov-25', target: 0, actual: null },
  { month: 'Dec-25', target: 15, actual: 12 },
  { month: 'Jan-26', target: 15, actual: 10 },
  { month: 'Feb-26', target: 15, actual: 8 },
]

// Total Defects: Customer Complaints target flat at 0, actual null
const INITIAL_CUSTOMER_COMPLAINTS_DATA = [
  { month: 'Apr-25', target: 0, actual: null },
  { month: 'May-25', target: 0, actual: null },
  { month: 'Jun-25', target: 0, actual: null },
  { month: 'Jul-25', target: 0, actual: null },
  { month: 'Aug-25', target: 0, actual: null },
  { month: 'Sep-25', target: 0, actual: null },
  { month: 'Oct-25', target: 0, actual: null },
  { month: 'Nov-25', target: 0, actual: null },
  { month: 'Dec-25', target: 0, actual: null },
  { month: 'Jan-26', target: 0, actual: null },
  { month: 'Feb-26', target: 0, actual: null },
]

export default function TotalDefects() {
  const [financialYear, setFinancialYear] = useState('2025-26')
  const [inHouseData, setInHouseData] = useState(INITIAL_IN_HOUSE_DATA)
  const [customerComplaintsData, setCustomerComplaintsData] = useState(INITIAL_CUSTOMER_COMPLAINTS_DATA)

  // Modal State for adding/updating month data
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    chartTitle: '',
    currentData: [],
    updater: null,
  })

  const handleOpenModal = (title, currentData, updater) => {
    setModalConfig({
      isOpen: true,
      chartTitle: title,
      currentData,
      updater,
    })
  }

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }))
  }

  const handleSaveMonthData = ({ month, target, actual }) => {
    if (modalConfig.updater) {
      modalConfig.updater((prevList) =>
        prevList.map((item) =>
          item.month === month ? { ...item, target, actual } : item
        )
      )
    }
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* LMS Module Page Header Banner */}
      <div className="bg-[#0b295c] text-white rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 shadow-xs mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
        <div>
          <h2 className="text-base sm:text-xl font-bold font-serif tracking-tight text-white select-none">
            Total Defects
          </h2>
        </div>
      </div>

      {/* Financial Year Selector Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-slate-700">Financial Year:</span>
        <div className="relative">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs outline-none focus:border-[#0047AB] focus:ring-1 focus:ring-[#0047AB] cursor-pointer"
          >
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2-Column Defect Tracking Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-6">
        {/* Card 1: In House Rejection (Scale 0 to 15.0 in steps of 1.5) */}
        <DefectTrendChart
          title="In House Rejection"
          subtitle="Monthly Target & Actual tracking"
          chartId="total-inhouse"
          icon={<AlertOctagon className="w-4 h-4 stroke-[2.2]" />}
          months={MONTHS}
          data={inHouseData}
          defaultMaxY={15.0}
          stepY={1.5}
          onAddDataClick={() =>
            handleOpenModal('In House Rejection', inHouseData, setInHouseData)
          }
        />

        {/* Card 2: Customer Complaints (Scale 0 to 3.5 in steps of 0.5) */}
        <DefectTrendChart
          title="Customer Complaints"
          subtitle="Monthly Target & Actual tracking"
          chartId="total-complaints"
          icon={<ShieldAlert className="w-4 h-4 stroke-[2.2]" />}
          months={MONTHS}
          data={customerComplaintsData}
          defaultMaxY={3.5}
          stepY={0.5}
          onAddDataClick={() =>
            handleOpenModal('Customer Complaints', customerComplaintsData, setCustomerComplaintsData)
          }
        />
      </div>

      {/* Interactive Add / Update Month Data Modal */}
      <AddMonthDataModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        chartTitle={modalConfig.chartTitle}
        months={MONTHS}
        currentData={modalConfig.currentData}
        onSave={handleSaveMonthData}
      />
    </div>
  )
}
