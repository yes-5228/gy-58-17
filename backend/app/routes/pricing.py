from fastapi import APIRouter

from app.models.domain import PricingRule
from app.schemas import HolidayDateCreate, PricingRuleCreate, PricingRuleUpdate
from app.services import pricing as pricing_service

router = APIRouter(tags=["pricing"])


@router.get("/pricing-rules", response_model=list[PricingRule])
def list_pricing_rules() -> list[PricingRule]:
    return pricing_service.list_pricing_rules()


@router.post("/pricing-rules", response_model=PricingRule, status_code=201)
def create_pricing_rule(payload: PricingRuleCreate) -> PricingRule:
    return pricing_service.create_pricing_rule(payload)


@router.patch("/pricing-rules/{rule_id}", response_model=PricingRule)
def update_pricing_rule(rule_id: int, payload: PricingRuleUpdate) -> PricingRule:
    return pricing_service.update_pricing_rule(rule_id, payload)


@router.delete("/pricing-rules/{rule_id}", status_code=204)
def delete_pricing_rule(rule_id: int) -> None:
    pricing_service.delete_pricing_rule(rule_id)


@router.get("/holidays", response_model=list[str])
def list_holidays() -> list[str]:
    return pricing_service.list_holiday_dates()


@router.post("/holidays", response_model=list[str])
def add_holiday(payload: HolidayDateCreate) -> list[str]:
    return pricing_service.add_holiday_date(payload.date)


@router.delete("/holidays/{date}", response_model=list[str])
def remove_holiday(date: str) -> list[str]:
    return pricing_service.remove_holiday_date(date)
