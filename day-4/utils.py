from colorama import Fore, Style

def read_input(input: str) -> str:
    file_path = f"./resources/{input}"
    with open(file_path, "r") as f:
        return f.read()
def info(any):
    print(f"{Fore.BLUE} INFO * {Style.RESET_ALL} {any}")
def debug(any):
    print(f"{Fore.RED} DEBUG ! {Style.RESET_ALL} {any}")
def error(any):
    print(f"{Fore.RED} ERROR ! {Style.RESET_ALL} {any}")
def success(any):
    print(f"{Fore.GREEN} SUCCESS ! {Style.RESET_ALL} {any}")


def print_grid_with_marks(grid: list[list[str]], marks: set[tuple[int, int]]):
    marked_grid = [[char for char in row] for row in grid]
    for row, col in marks:
        marked_grid[row][col] = f"{Fore.LIGHTYELLOW_EX}{grid[row][col]}{Style.RESET_ALL}"
    for row in marked_grid:
        print("".join(row))

def make_grid(blob: str) -> list[list[str]]:
    return [list(line) for line in blob.splitlines()]

def is_word_at(word: str, grid: list[list[str]], rows: int, cols: int, word_len: int, row, col, dir_row, dir_col):
    for i in range(word_len):
        new_row, new_col = (row + i * dir_row), (col + i * dir_col)
        if (
            new_row < 0 or new_row >= rows or
            new_col < 0 or new_col >= cols or
            grid[new_row][new_col] != word[i]
        ):
            return False
    return True

def count_word_occurrences(blob: str, word: str):
    grid = make_grid(blob)
    rows, cols = len(grid), len(grid[0])
    word_len = len(word)
    occurrences = 0
    dirs = [
        (0, 1),   # right
        (0, -1),  # left
        (1, 0),   # down
        (-1, 0),  # up
        (1, 1),   # diagonal down-right
        (1, -1),  # diagonal down-left
        (-1, 1),  # diagonal up-right
        (-1, -1)  # diagonal up-left
    ]

    for row in range(rows):
        for col in range(cols):
            for dir_row, dir_col in dirs:
                if is_word_at(word, grid, rows, cols, word_len, row, col, dir_row, dir_col):
                    occurrences += 1

    return occurrences


def test_part1():
    blob = read_input("test")
    occurrences = count_word_occurrences(blob, "XMAS")

    if occurrences == 18:
        success(f"[TEST] Need: 18, found: {occurrences}")
    else:
        error(f"[TEST] Need: 18, found: {occurrences}")

def real_part1():
    blob = read_input("real")
    occurrences = count_word_occurrences(blob, "XMAS")

    info(f"[REAL] found: {occurrences}")


def is_valid_dig(diag, text):
    m = diag[0]
    a = diag[1]
    s = diag[2]

    val = (
        m == "M" and a == "A" and s == "S" or
        m == "S" and a == "A" and s == "M"
    )

    if val:
        debug(f"{text}: {diag} -> {Fore.LIGHTGREEN_EX} True {Style.RESET_ALL}")
    else:
        debug(f"{text}: {diag} -> {Fore.RED} False {Style.RESET_ALL}")


    return val