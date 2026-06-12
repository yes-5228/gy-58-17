import { Plus, Tag, Trash2 } from 'lucide-react'

const ruleTypeLabel = { holiday: '节假日', evening: '晚场' }

export function PricingRulePanel({
  rules,
  holidays,
  newRule,
  newHoliday,
  onNewRuleChange,
  onNewHolidayChange,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onAddHoliday,
  onRemoveHoliday,
}) {
  return (
    <section className="panel pricing-panel">
      <div className="section-title">
        <Tag size={18} />
        <h2>活动价规则</h2>
      </div>

      <div className="pricing-body">
        <div className="pricing-section">
          <h3 className="pricing-subtitle">定价规则</h3>
          <div className="rule-list">
            {rules.map((rule) => (
              <div className={`rule-card ${rule.active ? '' : 'inactive'}`} key={rule.id}>
                <div className="rule-info">
                  <span className="rule-name">{rule.name}</span>
                  <span className="rule-tag">{ruleTypeLabel[rule.rule_type]}</span>
                  {rule.rule_type === 'evening' && rule.time_labels.length > 0 && (
                    <span className="rule-detail">{rule.time_labels.join(', ')}</span>
                  )}
                  {rule.court_ids.length > 0 && (
                    <span className="rule-detail">限定场地 #{rule.court_ids.join(', ')}</span>
                  )}
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

          <form className="inline-form" onSubmit={onAddRule}>
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
            {newRule.rule_type === 'evening' && (
              <input
                name="time_labels"
                placeholder="时段(逗号分隔)"
                value={newRule.time_labels}
                onChange={(e) => onNewRuleChange({ ...newRule, time_labels: e.target.value })}
              />
            )}
            <button type="submit" className="icon-btn primary">
              <Plus size={16} />
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
