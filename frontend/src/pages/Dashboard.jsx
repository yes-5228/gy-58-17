import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { BookingForm } from '../components/BookingForm.jsx'
import { BookingList } from '../components/BookingList.jsx'
import { CourtSchedule } from '../components/CourtSchedule.jsx'
import { DateTabs } from '../components/DateTabs.jsx'
import { Header } from '../components/Header.jsx'
import { PricingRulePanel } from '../components/PricingRulePanel.jsx'
import { todayISO } from '../utils/date.js'

const EMPTY_RULE = { name: '', rule_type: 'holiday', price: '', time_labels: '', court_ids: '' }

export function Dashboard() {
  const [courts, setCourts] = useState([])
  const [members, setMembers] = useState([])
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [pricingRules, setPricingRules] = useState([])
  const [holidays, setHolidays] = useState([])
  const [newRule, setNewRule] = useState({ ...EMPTY_RULE })
  const [newHoliday, setNewHoliday] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [contactName, setContactName] = useState('')
  const [memberId, setMemberId] = useState('1')
  const [message, setMessage] = useState('')

  async function loadBaseData() {
    const [courtData, memberData, bookingData] = await Promise.all([
      api.getCourts(),
      api.getMembers(),
      api.getBookings(),
    ])
    setCourts(courtData)
    setMembers(memberData)
    setBookings(bookingData)
  }

  async function loadPricingData() {
    const [ruleData, holidayData] = await Promise.all([
      api.getPricingRules(),
      api.getHolidays(),
    ])
    setPricingRules(ruleData)
    setHolidays(holidayData)
  }

  async function loadSlots(date) {
    const slotData = await api.getTimeSlots(date)
    setSlots(slotData)
    setSelectedSlot(null)
  }

  useEffect(() => {
    Promise.all([loadBaseData(), loadPricingData()]).catch((error) => setMessage(error.message))
  }, [])

  useEffect(() => {
    loadSlots(selectedDate).catch((error) => setMessage(error.message))
  }, [selectedDate])

  const courtsById = useMemo(
    () => Object.fromEntries(courts.map((court) => [court.id, court])),
    [courts],
  )

  const stats = useMemo(
    () => ({
      available: slots.filter((slot) => slot.status === 'available').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      paid: bookings.filter((booking) => booking.status === 'paid').length,
    }),
    [slots, bookings],
  )

  async function refresh() {
    await Promise.all([loadSlots(selectedDate), loadBaseData()])
  }

  async function handleCreateBooking(event) {
    event.preventDefault()
    if (!selectedSlot) return
    try {
      await api.createBooking({
        slot_id: selectedSlot.id,
        member_id: Number(memberId),
        contact_name: contactName.trim(),
      })
      setMessage('预约已提交，订单待结算')
      setContactName('')
      await refresh()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleToggleBlock(slot) {
    const status = slot.status === 'blocked' ? 'available' : 'blocked'
    try {
      await api.updateTimeSlot(slot.id, { status })
      await loadSlots(selectedDate)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleSettle(bookingId) {
    await api.settleBooking(bookingId)
    await refresh()
  }

  async function handleCancel(bookingId) {
    await api.cancelBooking(bookingId)
    await refresh()
  }

  async function handleAddRule(event) {
    event.preventDefault()
    try {
      const payload = {
        name: newRule.name,
        rule_type: newRule.rule_type,
        price: Number(newRule.price),
        time_labels: newRule.time_labels
          ? newRule.time_labels.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        court_ids: newRule.court_ids
          ? newRule.court_ids.split(',').map((s) => Number(s.trim())).filter(Boolean)
          : [],
      }
      await api.createPricingRule(payload)
      setNewRule({ ...EMPTY_RULE })
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleToggleRule(rule) {
    try {
      await api.updatePricingRule(rule.id, { active: !rule.active })
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDeleteRule(ruleId) {
    try {
      await api.deletePricingRule(ruleId)
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleMoveRule(ruleId, direction) {
    const rule = pricingRules.find((r) => r.id === ruleId)
    if (!rule) return
    const delta = direction === 'up' ? 1 : -1
    try {
      await api.updatePricingRule(ruleId, { priority: rule.priority + delta })
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleAddHoliday(event) {
    event.preventDefault()
    if (!newHoliday) return
    try {
      await api.addHoliday(newHoliday)
      setNewHoliday('')
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleRemoveHoliday(date) {
    try {
      await api.removeHoliday(date)
      await Promise.all([loadPricingData(), loadSlots(selectedDate)])
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="app-shell">
      <Header stats={stats} />
      <DateTabs selectedDate={selectedDate} onChange={setSelectedDate} />
      {message && <div className="notice">{message}</div>}
      <div className="main-grid">
        <CourtSchedule
          courts={courts}
          slots={slots}
          selectedSlotId={selectedSlot?.id}
          onSelectSlot={setSelectedSlot}
          onToggleBlock={handleToggleBlock}
        />
        <div className="side-stack">
          <PricingRulePanel
            rules={pricingRules}
            holidays={holidays}
            courts={courts}
            slots={slots}
            selectedSlot={selectedSlot}
            newRule={newRule}
            newHoliday={newHoliday}
            onNewRuleChange={setNewRule}
            onNewHolidayChange={setNewHoliday}
            onAddRule={handleAddRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onMoveRule={handleMoveRule}
            onAddHoliday={handleAddHoliday}
            onRemoveHoliday={handleRemoveHoliday}
          />
          <BookingForm
            members={members}
            selectedSlot={selectedSlot}
            contactName={contactName}
            memberId={memberId}
            onContactName={setContactName}
            onMemberId={setMemberId}
            onSubmit={handleCreateBooking}
          />
          <BookingList
            bookings={bookings}
            courtsById={courtsById}
            onSettle={handleSettle}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </main>
  )
}
