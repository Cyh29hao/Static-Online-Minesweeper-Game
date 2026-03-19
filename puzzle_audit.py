from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import argparse
import random
from typing import Iterable

SIZE = 10
CELL_COUNT = SIZE * SIZE


def index_of(row: int, col: int) -> int:
    return row * SIZE + col


@lru_cache(maxsize=None)
def neighbors_of(index: int) -> tuple[int, ...]:
    row, col = divmod(index, SIZE)
    cells: list[int] = []
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            rr = row + dr
            cc = col + dc
            if 0 <= rr < SIZE and 0 <= cc < SIZE:
                cells.append(index_of(rr, cc))
    return tuple(cells)


@dataclass(frozen=True)
class Equation:
    vars: frozenset[int]
    total: int


@dataclass
class SearchStats:
    solutions: int = 0
    nodes: int = 0
    max_depth: int = 0


@dataclass
class LayerReport:
    ok: bool
    assignments: list[int | None]
    progress: int
    unresolved: int
    passes: int


def board_from_string(board_string: str) -> list[int]:
    board = [int(ch) for ch in board_string.strip()]
    if len(board) != CELL_COUNT:
        raise ValueError(f"expected {CELL_COUNT} cells, got {len(board)}")
    return board


def clues_from_board(board: list[int]) -> list[int]:
    return [sum(board[n] for n in neighbors_of(index)) for index in range(CELL_COUNT)]


def build_equations(clues: list[int], mine_count: int | None) -> list[Equation]:
    equations = [Equation(frozenset(neighbors_of(index)), clues[index]) for index in range(CELL_COUNT)]
    if mine_count is not None:
        equations.append(Equation(frozenset(range(CELL_COUNT)), mine_count))
    return equations


def clone_assignments(assignments: list[int | None]) -> list[int | None]:
    return list(assignments)


def assign_value(assignments: list[int | None], var: int, value: int) -> bool:
    current = assignments[var]
    if current is None:
        assignments[var] = value
        return True
    return current == value


def reduce_equations(equations: list[Equation], assignments: list[int | None]) -> tuple[bool, list[Equation]]:
    reduced: list[Equation] = []
    seen: set[tuple[frozenset[int], int]] = set()
    for equation in equations:
        assigned_sum = 0
        vars_left: set[int] = set()
        for var in equation.vars:
            value = assignments[var]
            if value is None:
                vars_left.add(var)
            else:
                assigned_sum += value
        total_left = equation.total - assigned_sum
        if total_left < 0 or total_left > len(vars_left):
            return False, []
        key = (frozenset(vars_left), total_left)
        if key in seen:
            continue
        seen.add(key)
        reduced.append(Equation(frozenset(vars_left), total_left))
    return True, reduced


def direct_propagate(equations: list[Equation], assignments: list[int | None]) -> tuple[bool, bool]:
    changed = False
    while True:
        step_changed = False
        ok, reduced = reduce_equations(equations, assignments)
        if not ok:
            return False, changed
        for equation in reduced:
            if not equation.vars:
                continue
            if equation.total == 0:
                for var in equation.vars:
                    if not assign_value(assignments, var, 0):
                        return False, changed
                    step_changed = True
            elif equation.total == len(equation.vars):
                for var in equation.vars:
                    if not assign_value(assignments, var, 1):
                        return False, changed
                    step_changed = True
        if not step_changed:
            return True, changed
        changed = True


def subset_propagate(equations: list[Equation], assignments: list[int | None]) -> tuple[bool, bool]:
    changed = False
    ok, reduced = reduce_equations(equations, assignments)
    if not ok:
        return False, changed
    for i, left in enumerate(reduced):
        if not left.vars:
            continue
        for j, right in enumerate(reduced):
            if i == j or not right.vars or left.vars == right.vars:
                continue
            if left.vars.issubset(right.vars):
                diff_vars = right.vars - left.vars
                diff_total = right.total - left.total
                if diff_total < 0 or diff_total > len(diff_vars):
                    return False, changed
                if diff_vars and (diff_total == 0 or diff_total == len(diff_vars)):
                    forced = 0 if diff_total == 0 else 1
                    for var in diff_vars:
                        if not assign_value(assignments, var, forced):
                            return False, changed
                        changed = True
    return True, changed


def run_basic_solver(clues: list[int], mine_count: int | None, initial: list[int | None] | None = None) -> LayerReport:
    equations = build_equations(clues, mine_count)
    assignments = clone_assignments(initial) if initial is not None else [None] * CELL_COUNT
    passes = 0
    while True:
        passes += 1
        ok_direct, direct_changed = direct_propagate(equations, assignments)
        if not ok_direct:
            progress = sum(value is not None for value in assignments)
            return LayerReport(False, assignments, progress, CELL_COUNT - progress, passes)
        ok_subset, subset_changed = subset_propagate(equations, assignments)
        if not ok_subset:
            progress = sum(value is not None for value in assignments)
            return LayerReport(False, assignments, progress, CELL_COUNT - progress, passes)
        if not direct_changed and not subset_changed:
            progress = sum(value is not None for value in assignments)
            return LayerReport(True, assignments, progress, CELL_COUNT - progress, passes)


def unresolved_vars(assignments: list[int | None]) -> list[int]:
    return [index for index, value in enumerate(assignments) if value is None]


def choose_branch_var(equations: list[Equation], assignments: list[int | None]) -> int:
    counts = {index: 0 for index, value in enumerate(assignments) if value is None}
    for equation in equations:
        active = [var for var in equation.vars if assignments[var] is None]
        for var in active:
            counts[var] += len(active)
    return max(counts, key=lambda var: counts[var])


def run_advanced_solver(clues: list[int], mine_count: int | None, initial: list[int | None] | None = None) -> LayerReport:
    current = clone_assignments(initial) if initial is not None else [None] * CELL_COUNT
    passes = 0
    while True:
        passes += 1
        basic = run_basic_solver(clues, mine_count, current)
        if not basic.ok:
            return LayerReport(False, basic.assignments, basic.progress, basic.unresolved, passes)
        current = basic.assignments
        vars_left = unresolved_vars(current)
        if not vars_left:
            return LayerReport(True, current, CELL_COUNT, 0, passes)

        changed = False
        for var in vars_left:
            outcomes: dict[int, bool] = {}
            for guess in (0, 1):
                trial = clone_assignments(current)
                if not assign_value(trial, var, guess):
                    outcomes[guess] = False
                    continue
                outcomes[guess] = run_basic_solver(clues, mine_count, trial).ok

            ok0 = outcomes[0]
            ok1 = outcomes[1]
            if not ok0 and not ok1:
                return LayerReport(False, current, sum(v is not None for v in current), len(vars_left), passes)
            if not ok0 and ok1:
                if not assign_value(current, var, 1):
                    return LayerReport(False, current, sum(v is not None for v in current), len(unresolved_vars(current)), passes)
                changed = True
            elif ok0 and not ok1:
                if not assign_value(current, var, 0):
                    return LayerReport(False, current, sum(v is not None for v in current), len(unresolved_vars(current)), passes)
                changed = True

        if not changed:
            progress = sum(value is not None for value in current)
            return LayerReport(True, current, progress, CELL_COUNT - progress, passes)


def count_solutions(clues: list[int], mine_count: int | None, limit: int = 2) -> SearchStats:
    equations = build_equations(clues, mine_count)
    stats = SearchStats()

    def dfs(assignments: list[int | None], depth: int) -> None:
        if stats.solutions >= limit:
            return
        stats.nodes += 1
        stats.max_depth = max(stats.max_depth, depth)
        advanced = run_advanced_solver(clues, mine_count, assignments)
        if not advanced.ok:
            return
        local = advanced.assignments
        unresolved = unresolved_vars(local)
        if not unresolved:
            stats.solutions += 1
            return
        var = choose_branch_var(equations, local)
        for guess in (0, 1):
            branch = clone_assignments(local)
            if not assign_value(branch, var, guess):
                continue
            dfs(branch, depth + 1)
            if stats.solutions >= limit:
                return

    dfs([None] * CELL_COUNT, 0)
    return stats


def solve_with_assumptions(clues: list[int], mine_count: int | None) -> SearchStats:
    equations = build_equations(clues, mine_count)
    stats = SearchStats()

    def dfs(assignments: list[int | None], depth: int) -> bool:
        stats.nodes += 1
        stats.max_depth = max(stats.max_depth, depth)
        advanced = run_advanced_solver(clues, mine_count, assignments)
        if not advanced.ok:
            return False
        local = advanced.assignments
        unresolved = unresolved_vars(local)
        if not unresolved:
            stats.solutions = 1
            return True
        var = choose_branch_var(equations, local)
        for guess in (0, 1):
            branch = clone_assignments(local)
            if not assign_value(branch, var, guess):
                continue
            if dfs(branch, depth + 1):
                return True
        return False

    dfs([None] * CELL_COUNT, 0)
    return stats


def clue_histogram(clues: list[int]) -> dict[int, int]:
    hist = {n: 0 for n in range(9)}
    for value in clues:
        hist[value] += 1
    return hist


def dominant_ratio(clues: list[int]) -> float:
    hist = clue_histogram(clues)
    return max(hist.values()) / len(clues)


def analyze_board(board_string: str) -> dict[str, int | bool | float]:
    board = board_from_string(board_string)
    mine_count = sum(board)
    clues = clues_from_board(board)
    basic = run_basic_solver(clues, mine_count)
    advanced = run_advanced_solver(clues, mine_count)
    exact_with_total = count_solutions(clues, mine_count, limit=2)
    exact_without_total = count_solutions(clues, None, limit=3)
    deep = solve_with_assumptions(clues, mine_count)
    return {
        "mine_count": mine_count,
        "basic_ok": basic.ok,
        "basic_progress": basic.progress,
        "basic_unresolved": basic.unresolved,
        "basic_passes": basic.passes,
        "advanced_ok": advanced.ok,
        "advanced_progress": advanced.progress,
        "advanced_unresolved": advanced.unresolved,
        "advanced_passes": advanced.passes,
        "unique_with_total": exact_with_total.solutions == 1,
        "solutions_without_total": exact_without_total.solutions,
        "deep_nodes": deep.nodes,
        "deep_depth": deep.max_depth,
        "dominant_clue_ratio": round(dominant_ratio(clues), 3),
    }


def random_board(rng: random.Random, mine_probability: float) -> str:
    return "".join("1" if rng.random() < mine_probability else "0" for _ in range(CELL_COUNT))


def style_bonus(report: dict[str, int | bool | float], profile: str) -> int:
    mine_count = int(report["mine_count"])
    dominant = float(report["dominant_clue_ratio"])
    without_total = int(report["solutions_without_total"])
    bonus = 0
    if profile == "dense":
        bonus += max(0, mine_count - 58) * 50
    elif profile == "sparse":
        bonus += max(0, 36 - mine_count) * 45
    elif profile == "uniform":
        bonus += int(dominant * 1200)
    elif profile == "total":
        bonus += 900 if without_total > 1 else 0
    elif profile == "balanced":
        bonus += 300 if 40 <= mine_count <= 56 else 0
    return bonus


def score_report(report: dict[str, int | bool | float], profile: str) -> int:
    if not report["unique_with_total"]:
        return -10**9
    return (
        int(report["basic_unresolved"]) * 300
        + int(report["advanced_unresolved"]) * 450
        + int(report["deep_depth"]) * 1200
        + min(int(report["deep_nodes"]), 9999)
        + (800 if int(report["basic_progress"]) == 0 else 0)
        + (1000 if int(report["advanced_progress"]) <= 6 else 0)
        + style_bonus(report, profile)
    )


def search(seed: int, attempts: int, profile: str) -> None:
    rng = random.Random(seed)
    best_score = None
    best_board = None
    best_report = None
    profile_ranges = {
        "dense": (0.58, 0.72),
        "balanced": (0.42, 0.55),
        "sparse": (0.24, 0.36),
        "uniform": (0.38, 0.52),
        "total": (0.40, 0.54),
    }
    low, high = profile_ranges[profile]
    for _ in range(attempts):
        board = random_board(rng, mine_probability=rng.uniform(low, high))
        report = analyze_board(board)
        score = score_report(report, profile)
        if best_score is None or score > best_score:
            best_score = score
            best_board = board
            best_report = report
    print(best_board)
    print(best_report)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["analyze", "search"])
    parser.add_argument("board", nargs="?")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--attempts", type=int, default=200)
    parser.add_argument("--profile", choices=["dense", "balanced", "sparse", "uniform", "total"], default="balanced")
    args = parser.parse_args()

    if args.mode == "analyze":
        if not args.board:
            raise SystemExit("board string required")
        print(analyze_board(args.board))
    else:
        search(args.seed, args.attempts, args.profile)


if __name__ == "__main__":
    main()
