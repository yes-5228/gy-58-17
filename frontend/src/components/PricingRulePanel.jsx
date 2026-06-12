import { ArrowDown, ArrowUp, Check, Plus, Sparkles, Tag, Trash2 } from 'lucide-react'

const ruleTypeLabel = { holiday: '节假日', evening: '晚场' }

function ruleMatchesSlot(rule, slot, holidays) {
  if (!slot) return false
  if (!rule.active) return false
  if (rule.court_ids.length > 0 && !rule.court_ids.includes(slot.court_id)) return false
  const isHoliday = holidays.includes(slot.date)
  if (rule.rule_type === 'holiday' && !isHoliday) return false
  if (rule.time_labels.length > 0 && !rule.time_labels.includes(slot.label)) return false
  return true
}

function computeRuleDayStatus(rules, slots, holidays) {
  const appliedSet = new Set()
  const matchedSet = new Set()
  for (const slot of slots) {
    for (const rule of rules) {
      if (ruleMatchesSlot(rule, slot, holidays)) {
        matchedSet.add(rule.id)
        if (slot.matched_rule_id === rule.id) {
          appliedSet.add(rule.id)
        }
      }
    }
  }
  return { appliedSet, matchedSet }
}

export function PricingRulePanel({
  rules,
  holidays,
  courts,
  slots,
  selectedSlot,
  newRule,
  newHoliday,
  onNewRuleChange,
  onNewHolidayChange,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onMoveRule,
  onAddHoliday,
  onRemoveHoliday,
}) {
  const courtsById = courts.reduce((acc, c) => {
    acc[c.id] = c
    return acc
  }, {})

  const selectedCourtIds = newRule.court_ids
    ? newRule.court_ids.split(',').map((s) => Number(s.trim())).filter(Boolean)
    : []

  function handleCourtToggle(courtId) {
    const current = selectedCourtIds
    const next = current.includes(courtId)
      ? current.filter((id) => id !== courtId)
      : [...current, courtId]
    onNewRuleChange({ ...newRule, court_ids: next.join(',') })
  }

  const { appliedSet, matchedSet } = computeRuleDayStatus(rules, slots, holidays)

  function getRuleClasses(rule) {
    const classes = ['rule-card']
    if (!rule.active) classes.push('inactive')
    const isApplied = appliedSet.has(rule.id)
    const isMatched = matchedSet.has(rule.id)
    if (isApplied) classes.push('applied')
    else if (isMatched) classes.push('matched')
    return classes
  }

  function getRuleBadge(rule) {
    if (!rule.active) return null
    if (appliedSet.has(rule.id)) {
      return (
        <span className="rule-badge applied-badge">
          <Sparkles size={10} /> 生效中
        </span>
      )
    }
    if (matchedSet.has(rule.id)) {
      return (
        <span className="rule-badge matched-badge">
          <Check size={10} /> 匹配
        </span>
      )
    }
    return <span className="rule-badge idle-badge">未匹配</span>
  }

  return (
    <section className="panel pricing-panel">
      <div className="section-title">
        <Tag size={18} />
        <h2>活动价规则</h2>
        {selectedSlot && (
          <span className="hint-badge">
            <Sparkles size={12} /> 已选中: {selectedSlot.label}
          </span>
        )}
      </div>

      <div className="pricing-body">
        <div className="pricing-section">
          <h3 className="pricing-subtitle">定价规则 <span className="muted-text">(越高越优先)</span></h3>
          <div className="rule-list">
            {rules.map((rule, index) => (
              <div className={getRuleClasses(rule).join(' ')} key={rule.id}>
                <div className="rule-priority-col">
                  <button
                    type="button"
                    className="icon-btn tiny"
                    disabled={index === 0}
                    onClick={() => onMoveRule(rule.id, 'up')}
                    title="提高优先级"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <span className="priority-num">{rule.priority}</span>
                  <button
                    type="button"
                    className="icon-btn tiny"
                    disabled={index === rules.length - 1}
                    onClick={() => onMoveRule(rule.id, 'down')}
                    title="降低优先级"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                <div className="rule-info">
                  <span className="rule-name">{rule.name}</span>
                  <span className="rule-tag">{ruleTypeLabel[rule.rule_type]}</span>
                  {rule.time_labels.length > 0 && (
                    <span className="rule-detail">{rule.time_labels.join(', ')}</span>
                  )}
                  {rule.court_ids.length > 0 && (
                    <span className="rule-detail">
                      限定场地: {rule.court_ids.map((id) => courtsById[id]?.name || `#${id}`).join(', ')}
                    </span>
                  )}
                  {getRuleBadge(rule)}
                </div>
                <div className="rule-price">
                  <span>¥{rule.price}</span>
                </div>
                <div className="rule-actions">
                  <button
                    type="button"
                    className={`toggle-btn ${rule.active ? 'active' : ''}`}
                    onClick={() => onToggleRule(rule)}
                  >
                    {rule.active ? '启用' : '停用'}
                  </button>
                  <button type="button" className="icon-btn danger" onClick={() => onDeleteRule(rule.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form className="rule-form" onSubmit={onAddRule}>
            <div className="rule-form-row">
              <input
                name="name"
                placeholder="规则名称"
                value={newRule.name}
                onChange={(e) => onNewRuleChange({ ...newRule, name: e.target.value })}
              />
              <select
                value={newRule.rule_type}
                onChange={(e) => onNewRuleChange({ ...newRule, rule_type: e.target.value })}
              >
                <option value="holiday">节假日</option>
                <option value="evening">晚场</option>
              </select>
              <input
                name="price"
                type="number"
                step="1"
                min="1"
                placeholder="活动价"
                value={newRule.price}
                onChange={(e) => onNewRuleChange({ ...newRule, price: e.target.value })}
              />
            </div>
            <div className="rule-form-row">
              <input
                name="time_labels"
                placeholder="适用时段(逗号分隔, 留空=全部时段)"
                value={newRule.time_labels}
                onChange={(e) => onNewRuleChange({ ...newRule, time_labels: e.target.value })}
              />
            </div>
            <div className="rule-form-row court-picker-row">
              <label className="court-picker-label">适用场地:</label>
              <div className="court-picker">
                {courts.map((court) => (
                  <button
                    type="button"
                    key={court.id}
                    className={`court-chip ${selectedCourtIds.includes(court.id) ? 'selected' : ''}`}
                    onClick={() => handleCourtToggle(court.id)}
                  >
                    {court.name}
                  </button>
                ))}
                {selectedCourtIds.length === 0 && (
                  <span className="muted-text">未选择=全部场地</span>
                )}
              </div>
            </div>
            <button type="submit" className="primary-action small">
              <Plus size={14} /> 新增规则
            </button>
          </form>
        </div>

        <div className="pricing-section">
          <h3 className="pricing-subtitle">节假日日期</h3>
          <div className="holiday-chips">
            {holidays.map((d) => (
              <span className="holiday-chip" key={d}>
                {d}
                <button type="button" className="chip-remove" onClick={() => onRemoveHoliday(d)}>
                  ×
                </button>
              </span>
            ))}
            {holidays.length === 0 && <span className="muted-text">暂无节假日配置</span>}
          </div>
          <form className="inline-form" onSubmit={onAddHoliday}>
            <input
              name="holiday_date"
              type="date"
              value={newHoliday}
              onChange={(e) => onNewHolidayChange(e.target.value)}
            />
            <button type="submit" className="icon-btn primary">
              <Plus size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
