import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@SuppressWarnings("ALL")
public class Main {
    public static void main(String[] args) throws IOException {
        List<String> input = utils.readInput("sample2.txt");

        int safeCount = calculateSafeReports(input, false);
        System.out.println("Number of safe reports: " + safeCount);

        int safeCountWithDampener = calculateSafeReports(input, true);
        System.out.println("Number of safe reports with Problem Dampener: " + safeCountWithDampener);
    }

    private static int calculateSafeReports(List<String> input, boolean useDampener) {
        int safeCount = 0;
        for (String line : input) {
            int[] levels = Arrays.stream(line.split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();

            if (utils.isSafe(levels) || (useDampener && utils.canBeSafeWithOneRemoval(levels))) {
                safeCount++;
            }
        }
        return safeCount;
    }
}
