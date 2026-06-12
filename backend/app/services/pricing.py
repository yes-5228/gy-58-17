from fastapi import HTTPException

from app.data.store import store
from app.models.domain import PricingRule, TimeSlot
from app.schemas import PricingRuleCreate, PricingRuleUpdate


def list_pricing_rules() -> list[PricingRule]:
    return list(store.pricing_rules.values())


def create_pricing_rule(payload: PricingRuleCreate) -> PricingRule:
    rule_id = store.next_rule_id()
    rule = PricingRule(id=rule_id, **payload.model_dump())
    store.pricing_rules[rule_id] = rule
    return rule


def update_pricing_rule(rule_id: int, payload: PricingRuleUpdate) -> PricingRule:
    rule = store.pricing_rules.get(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="定价规则不存在")
    update_data = payload.model_dump(exclude_unset=True)
    updated = rule.model_copy(update=update_data)
    store.pricing_rules[rule_id] = updated
    return updated


def delete_pricing_rule(rule_id: int) -> None:
    if rule_id not in store.pricing_rules:
        raise HTTPException(status_code=404, detail="定价规则不存在")
    del store.pricing_rules[rule_id]


def list_holiday_dates() -> list[str]:
    return sorted(store.holiday_dates)


def add_holiday_date(date: str) -> list[str]:
    store.holiday_dates.add(date)
    return sorted(store.holiday_dates)


def remove_holiday_date(date: str) -> list[str]:
    store.holiday_dates.discard(date)
    return sorted(store.holiday_dates)


def compute_activity_price(slot: TimeSlot) -> float | None:
    candidates = []
    is_holiday = slot.date in store.holiday_dates
    for rule in store.pricing_rules.values():
        if not rule.active:
            continue
        if rule.court_ids and slot.court_id not in rule.court_ids:
            continue
        if rule.rule_type == "holiday" and not is_holiday:
            continue
        if rule.time_labels and slot.label not in rule.time_labels:
            continue
        score = 0
        if rule.court_ids:
            score += 3
        if rule.time_labels:
            score += 2
        if rule.rule_type == "holiday":
            score += 4
        candidates.append((score, -rule.id, rule))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][2].price
