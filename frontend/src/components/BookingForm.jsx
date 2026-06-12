import { CreditCard } from 'lucide-react'

export function BookingForm({ members, selectedSlot, contactName, memberId, onContactName, onMemberId, onSubmit }) {
  const member = members.find((item) => item.id === Number(memberId))
  const effectivePrice = selectedSlot ? (selectedSlot.activity_price ?? selectedSlot.price) : 0
  const amount = selectedSlot && member ? (effectivePrice * member.discount_rate).toFixed(2) : '0.00'

  return (
    <section className="panel booking-panel">
      <div className="section-title">
        <CreditCard size={18} />
        <h2>在线预约与费用结算</h2>
      </div>
      <form onSubmit={onSubmit} className="form-grid">
        <label>
          预约人
          <input value={contactName} onChange={(event) => onContactName(event.target.value)} placeholder="输入姓名" />
        </label>
        <label>
          会员折扣
          <select value={memberId} onChange={(event) => onMemberId(event.target.value)}>
            {members.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.level} · {(item.discount_rate * 10).toFixed(1)}折
              </option>
            ))}
          </select>
        </label>
        <div className="settlement-box">
          <span>当前时段</span>
          <strong>{selectedSlot ? selectedSlot.label : '请选择可预约时段'}</strong>
          {selectedSlot && selectedSlot.activity_price != null && (
            <>
              <span>原价</span>
              <strong className="price-original">¥{selectedSlot.price}</strong>
              <span>活动价</span>
              <strong className="price-activity">¥{selectedSlot.activity_price}</strong>
            </>
          )}
          <span>应付金额</span>
          <strong>¥{amount}</strong>
        </div>
        <button className="primary-action" type="submit" disabled={!selectedSlot || !contactName.trim()}>
          提交预约
        </button>
      </form>
    </section>
  )
}
