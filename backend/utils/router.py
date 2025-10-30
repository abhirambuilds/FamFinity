import re
from enum import Enum
from typing import Callable, Dict, List, Optional, Tuple


class RouteTarget(str, Enum):
    FINANCE = "finance"
    CHAT = "chat"


class QueryRouter:
    """Deterministic, easily extensible keyword-based router.

    Rules are evaluated in order. The first matching rule determines the route.
    """

    def __init__(self) -> None:
        self._rules: List[Tuple[str, Callable[[str], bool], RouteTarget]] = []
        self._default: RouteTarget = RouteTarget.CHAT

        # Default finance keywords per spec
        finance_keywords = [
            "how much",
            "save",
            "spend",
            "budget",
            "predict",
            "graph",
        ]

        def contains_any(keywords: List[str]) -> Callable[[str], bool]:
            patterns = [re.compile(re.escape(k), re.IGNORECASE) for k in keywords]

            def _matcher(text: str) -> bool:
                return any(p.search(text or "") is not None for p in patterns)

            return _matcher

        self.register_rule(
            name="finance-keywords",
            predicate=contains_any(finance_keywords),
            target=RouteTarget.FINANCE,
        )

    def register_rule(self, name: str, predicate: Callable[[str], bool], target: RouteTarget) -> None:
        self._rules.append((name, predicate, target))

    def route(self, query: str) -> RouteTarget:
        for _, predicate, target in self._rules:
            if predicate(query):
                return target
        return self._default

    def route_with_reason(self, query: str) -> Tuple[RouteTarget, Optional[str]]:
        for name, predicate, target in self._rules:
            if predicate(query):
                return target, name
        return self._default, None


# Singleton router instance for convenience
router = QueryRouter()


