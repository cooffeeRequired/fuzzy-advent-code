
from utils import read_input, success, error, info, test_part1, real_part1, debug, make_grid, print_grid_with_marks, \
    is_valid_dig
from colorama import Fore, Style

def is_x_mas_at(grid: list[list[str]],row: int,col: int) -> bool:

    if grid[row][col] == "A":
        if grid[row-1][col-1] == "M" and grid[row + 1][col - 1] == "M" and grid[row + 1][col + 1] == "S" and grid[row - 1][col + 1] == "S": return True
        if grid[row+1][col-1] == "M" and grid[row + 1][col + 1] == "M" and grid[row - 1][col - 1] == "S" and grid[row - 1][col + 1] == "S": return True
        if grid[row+1][col+1] == "M" and grid[row - 1][col + 1] == "M" and grid[row - 1][col - 1] == "S" and grid[row + 1][col - 1] == "S": return True
        if grid[row-1][col-1] == "M" and grid[row - 1][col + 1] == "M" and grid[row + 1][col - 1] == "S" and grid[row + 1][col + 1] == "S": return True

    return False

def count_x_mas_patterns(blob:str) -> int:
    grid = make_grid(blob)
    rows, cols = len(grid), len(grid[0])
    occurrences = 0

    marks = set()

    for row in range(1, rows - 1):
        for col in range(1, cols - 1):
            if is_x_mas_at(grid, row, col):
                occurrences += 1
                marks.add((row - 1, col - 1))
                marks.add((row + 1, col + 1))
                marks.add((row - 1, col + 1))
                marks.add((row + 1, col - 1))
                marks.add((row, col))


    print_grid_with_marks(grid, marks)
    return occurrences


def test_part2():
    blob = read_input("test")
    occurrences = count_x_mas_patterns(blob)

    if occurrences == 9:
        success(f"[TEST PART 2] Need: 9, found: {occurrences}")
    else:
        error(f"[TEST PART 2] Need: 9, found: {occurrences}")


def real_part2():
    blob = read_input("real")
    occurrences = count_x_mas_patterns(blob)

    info(f"[REAL PART 2] found: {occurrences}")


def main():
   test_part1()
   real_part1()

   test_part2()
   real_part2()

if __name__ == '__main__':
    main()