import re
from datetime import datetime, date
from typing import Optional


def parse_date(value: object) -> date:
    """Parse common date strings to date. Supports YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, YYYY-MM.

    If only year-month is provided (YYYY-MM), returns the first day of that month.
    """
    if isinstance(value, date):
        return value
    if value is None:
        raise ValueError("Date value is required")

    text = str(value).strip()
    # Try ISO full date
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            pass

    # Year-month (YYYY-MM) -> first day of month
    if re.fullmatch(r"\d{4}-\d{2}", text):
        return datetime.strptime(text + "-01", "%Y-%m-%d").date()

    # Fallback: pandas-like parser via datetime.fromisoformat if possible
    try:
        return datetime.fromisoformat(text).date()
    except Exception as exc:
        raise ValueError(f"Unrecognized date format: {text}") from exc


def normalize_amount(value: object) -> float:
    """Normalize amount values to float.

    Accepts strings with commas, currency symbols, and parentheses for negatives.
    Examples: "$1,234.56", "(123.45)", "-99.10", 100
    """
    if value is None:
        raise ValueError("Amount is required")

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()
    if not text:
        raise ValueError("Amount cannot be empty")

    negative = False
    if text.startswith("(") and text.endswith(")"):
        negative = True
        text = text[1:-1]

    # Remove currency symbols and thousands separators
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    if cleaned.count("-") > 1:
        raise ValueError("Invalid amount format")

    try:
        amount = float(cleaned)
    except ValueError as exc:
        raise ValueError(f"Invalid amount: {value}") from exc

    return -amount if negative else amount


def map_category(raw_category: Optional[str]) -> str:
    """Map noisy categories to a normalized set with simple rules.

    This uses basic keyword matching. Extend as needed.
    """
    if not raw_category:
        return "Other"

    text = str(raw_category).strip().lower()

    rules = {
        "groceries": ["grocery", "supermarket", "market", "whole foods", "aldi", "kroger", "food lion"],
        "rent": ["rent", "landlord"],
        "utilities": ["utility", "electric", "water", "gas", "internet", "wifi", "phone"],
        "transportation": ["uber", "lyft", "gas station", "fuel", "parking", "metro", "bus", "train"],
        "dining": ["restaurant", "dining", "cafe", "coffee", "bar", "starbucks", "mcdonald", "pizza"],
        "entertainment": ["movie", "netflix", "spotify", "hulu", "disney"],
        "health": ["pharmacy", "doctor", "dentist", "hospital", "insurance"],
        "shopping": ["amazon", "target", "walmart", "mall", "retail"],
        "income": ["payroll", "salary", "paycheck", "deposit", "income"],
    }

    for normalized, keywords in rules.items():
        if any(k in text for k in keywords):
            return normalized.capitalize() if normalized != "income" else "Income"

    # Capitalize first letter for readability
    return text.capitalize() if text else "Other"


