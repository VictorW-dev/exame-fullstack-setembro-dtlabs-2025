# app/services/rules.py
from app.models.notification import NotificationRule


# OBS: simples — avalia expressões do tipo "cpu > 70" com dict de métricas


def match_rule(expr: str, metrics: dict) -> bool:
    # MUITO simples: suporta operadores >, <, >=, <=, ==
    # Ex.: expr="temperature > 70" -> metrics["temperature"] > 70
    tokens = expr.split()
    if len(tokens) != 3:
        return False
    lhs, op, rhs = tokens
    val = float(metrics.get(lhs, float("inf")))
    thr = float(rhs)
    return (
        (op == ">" and val > thr) or
        (op == ">=" and val >= thr) or
        (op == "<" and val < thr) or
        (op == "<=" and val <= thr) or
        (op == "==" and val == thr)
    )