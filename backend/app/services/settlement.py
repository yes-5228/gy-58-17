from app.models.domain import Member, TimeSlot


def effective_price(slot: TimeSlot) -> float:
    return slot.activity_price if slot.activity_price is not None else slot.price


def calculate_payable(slot: TimeSlot, member: Member) -> tuple[float, float, float]:
    original = round(effective_price(slot), 2)
    discount = member.discount_rate
    payable = round(original * discount, 2)
    return original, discount, payable
