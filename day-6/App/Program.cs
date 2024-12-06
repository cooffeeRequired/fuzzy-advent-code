namespace App
{
    public static class ProgramExtensions
    {
        public static void DebugWrite(this object o) => Console.WriteLine($"\e[1;36mDEBUG:\e[0m {o}");
        public static void InfoWrite(this object o) => Console.WriteLine($"\e[1;34mINFO:\e[0m {o}");
        public static void SuccessWrite(this object o) => Console.WriteLine($"\e[1;32mSUCCESS:\e[0m {o}");
        public static void WarningWrite(this object o) => Console.WriteLine($"\e[1;33mWARNING:\e[0m {o}");
        public static void ErrorWrite(this object o) => Console.WriteLine($"\e[1;5;31mERROR:\e[0m {o}");
    }

    public abstract class Program
    {
        private static string ReadInput(string input)
        {
            var appBasePath = AppContext.BaseDirectory;
            var appSrcRoot = Directory.GetParent(appBasePath)?.Parent?.Parent?.Parent?.FullName;

            var resourcesPath = Path.Combine(appSrcRoot ?? "", "resources");
            var filePath = Path.Combine(resourcesPath, input);

            if (File.Exists(filePath))
            {
                $"Input file found: {filePath}".SuccessWrite();
                return File.ReadAllText(filePath);
            }

            $"Input file not found: {filePath}".ErrorWrite();
            return string.Empty;
        }

        private static void Main()
        {
            var content = ReadInput("real");
            if (string.IsNullOrWhiteSpace(content))
            {
                "Input content is empty or file does not exist.".ErrorWrite();
                return;
            }

            var map = content.Split("\n", StringSplitOptions.RemoveEmptyEntries);
            $"Map loaded with {map.Length} rows.".InfoWrite();

            var guardStepsCount = GuardMovement(map);

            $"Distinct positions visited: {guardStepsCount}".SuccessWrite();

            var obstructionPositions = FindLoopObstructionPositionsParallel(map);

            if (obstructionPositions.Count != 0)
            {
                $"Possible obstruction positions to cause a loop: {obstructionPositions.Count}".SuccessWrite();
            }
            else
            {
                "No obstruction positions found that could cause a loop.".WarningWrite();
            }
        }

        private static int GuardMovement(string[] input)
        {
            var directions = new (int r, int c)[] { (-1, 0), (0, 1), (1, 0), (0, -1) };
            var direction = 0;

            var (guardRow, guardCol) = FindInitialPosition(input, '^');
            if (guardRow == -1 || guardCol == -1) return 0;

            var visited = new HashSet<(int, int)> { (guardRow, guardCol) };
            $"Initial guard position: ({guardRow}, {guardCol})".DebugWrite();

            while (true)
            {
                var nextRow = guardRow + directions[direction].r;
                var nextCol = guardCol + directions[direction].c;

                if (IsOutOfBounds(nextRow, nextCol, input))
                {
                    "Guard moved out of bounds.".WarningWrite();
                    break;
                }

                if (input[nextRow][nextCol] == '#')
                {
                    direction = (direction + 1) % 4;
                    $"Obstacle detected. Changing direction to {direction}.".DebugWrite();
                }
                else
                {
                    guardRow = nextRow;
                    guardCol = nextCol;
                    visited.Add((guardRow, guardCol));
                    $"Guard moved to ({guardRow}, {guardCol}).".InfoWrite();
                }
            }

            return visited.Count;
        }

        private static HashSet<(int, int)> FindLoopObstructionPositionsParallel(string[] input)
        {
            var directions = new (int r, int c)[] { (-1, 0), (0, 1), (1, 0), (0, -1) };
            var possibleObstructions = new HashSet<(int, int)>();

            var lockObj = new object();

            Parallel.For(0, input.Length, row =>
            {
                for (var col = 0; col < input[row].Length; col++)
                {
                    if (input[row][col] == '#' || input[row][col] == '^') continue;

                    if (!CreatesLoop(input, row, col, directions)) continue;
                    lock (lockObj)
                    {
                        possibleObstructions.Add((row, col));
                    }
                    $"Obstruction at ({row}, {col}) can cause a loop.".DebugWrite();
                }
            });

            return possibleObstructions;
        }

        private static bool CreatesLoop(string[] map, int blockRow, int blockCol, (int r, int c)[] directions)
        {
            var visitedStates = new HashSet<(int, int, int)>();
            var direction = 0;

            var (guardRow, guardCol) = FindInitialPosition(map, '^');
            if (guardRow == -1 || guardCol == -1) return false;

            while (true)
            {
                var state = (guardRow, guardCol, direction);
                if (!visitedStates.Add(state))
                {
                    $"Loop detected at state ({guardRow}, {guardCol}, {direction}).".ErrorWrite();
                    return true;
                }

                var nextRow = guardRow + directions[direction].r;
                var nextCol = guardCol + directions[direction].c;

                if (IsOutOfBounds(nextRow, nextCol, map)) break;

                if (nextRow == blockRow && nextCol == blockCol || map[nextRow][nextCol] == '#')
                {
                    direction = (direction + 1) % 4;
                }
                else
                {
                    guardRow = nextRow;
                    guardCol = nextCol;
                }
            }

            return false;
        }

        private static (int, int) FindInitialPosition(string[] map, char target)
        {
            for (var r = 0; r < map.Length; r++)
            {
                var col = map[r].IndexOf(target);
                if (col != -1) return (r, col);
            }
            return (-1, -1);
        }

        private static bool IsOutOfBounds(int row, int col, string[] map)
            => row < 0 || row >= map.Length || col < 0 || col >= map[0].Length;
    }
}
