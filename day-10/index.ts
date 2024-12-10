import chalk from "chalk";



const readInput = async (filepath: string): Promise<string[]> => {
    const file = Bun.file(filepath);
    if (file) {
        const content = await file.text();
        console.log(chalk.blue("[DEBUG] File content loaded."));
        return content.split('\n').map(line => line.trim());
    }
    throw new Error("Failed to read input file");
};



const calculateTrailheadScores = (map: string[], directions: number[][]): number => {
    const height = map.length;
    const width = map[0].length;

    const isValid = (x: number, y: number) => x >= 0 && x < height && y >= 0 && y < width;

    let visited: boolean[][];
    let reachableNines: Set<string>;

    const dfs = (x: number, y: number, currentHeight: number): boolean => {
        console.log(chalk.yellow(`[DEBUG] DFS called: x=${x}, y=${y}, currentHeight=${currentHeight}`));
        if (!isValid(x, y) || visited[x][y] || parseInt(map[x][y]) !== currentHeight) {
            console.log(chalk.red(`[DEBUG] Invalid or visited node at x=${x}, y=${y}`));
            return false;
        }

        if (currentHeight === 9) {
            console.log(chalk.green(`[DEBUG] Found height 9 at x=${x}, y=${y}`));
            reachableNines.add(`${x},${y}`);
            return true;
        }

        visited[x][y] = true;

        let foundTrail = false;
        for (const [dx, dy] of directions) {
            foundTrail = dfs(x + dx, y + dy, currentHeight + 1) || foundTrail;
        }

        return foundTrail;
    };

    let totalScore = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (map[i][j] === '0') {
                console.log(chalk.cyan(`[DEBUG] Starting DFS from trailhead at x=${i}, y=${j}`));
                visited = Array.from({ length: height }, () => Array(width).fill(false));
                reachableNines = new Set<string>();

                dfs(i, j, 0);

                totalScore += reachableNines.size;
            }
        }
    }

    console.log(chalk.magenta(`[DEBUG] Total score calculated: ${totalScore}`));
    return totalScore;
};



const calculateTrailheadRatings = (map: string[], directions: number[][]): number => {
    const height = map.length;
    const width = map[0].length;

    const isValid = (x: number, y: number) => x >= 0 && x < height && y >= 0 && y < width;

    const dfs = (x: number, y: number, currentHeight: number): number => {
        console.log(chalk.yellow(`[DEBUG] DFS called: x=${x}, y=${y}, currentHeight=${currentHeight}`));
        if (!isValid(x, y) || visited[x][y] || parseInt(map[x][y]) !== currentHeight) {
            console.log(chalk.red(`[DEBUG] Invalid or visited node at x=${x}, y=${y}`));
            return 0;
        }

        if (currentHeight === 9) {
            console.log(chalk.green(`[DEBUG] Found height 9 at x=${x}, y=${y}`));
            return 1;
        }

        visited[x][y] = true;

        let trailCount = 0;
        for (const [dx, dy] of directions) {
            trailCount += dfs(x + dx, y + dy, currentHeight + 1);
        }

        visited[x][y] = false; // Unmark to allow other paths
        return trailCount;
    };

    let visited: boolean[][];
    let totalRating = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (map[i][j] === '0') {
                console.log(chalk.cyan(`[DEBUG] Starting DFS from trailhead at x=${i}, y=${j}`));
                visited = Array.from({ length: height }, () => Array(width).fill(false));
                totalRating += dfs(i, j, 0);
            }
        }
    }

    console.log(chalk.magenta(`[DEBUG] Total rating calculated: ${totalRating}`));
    return totalRating;
};

const main = async () => {
    try {
        const directions = [
            [0, 1],   // Right
            [0, -1],  // Left
            [1, 0],   // Down
            [-1, 0],  // Up
        ];

        const inputFilePath = "./resources/real"; // Replace with the actual path to your input file
        console.log(chalk.blue(`[DEBUG] Reading input file from ${inputFilePath}`));
        const map = await readInput(inputFilePath);
        console.log(chalk.blue("[DEBUG] Input file successfully read."));

        const score = calculateTrailheadScores(map, directions);
        console.log(chalk.yellow("Total score of all trailheads:"), chalk.green(score));

        const rating = calculateTrailheadRatings(map, directions);
        console.log(chalk.yellow("Total rating of all trailheads:"), chalk.green(rating));
    } catch (error) {
        console.error(chalk.red("Error:"), error);
    }
};

await main();
