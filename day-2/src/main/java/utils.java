import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

class utils {
    public static List<String> readInput(String fileName) throws IOException {
        List<String> lines = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            while ((line = br.readLine()) != null) {
                lines.add(line.trim());
            }
        }
        return lines;
    }

    public static boolean isSafe(int[] levels) {
        boolean increasing = true, decreasing = true;

        for (int i = 1; i < levels.length; i++) {
            int diff = levels[i] - levels[i - 1];

            if (diff < -3 || diff > 3 || diff == 0) {
                return false;
            }

            if (diff < 0) decreasing = false;
            if (diff > 0) increasing = false;
        }
        return increasing || decreasing;
    }

    public static boolean canBeSafeWithOneRemoval(int[] levels) {
        for (int i = 0; i < levels.length; i++) {
            int[] modifiedLevels = new int[levels.length - 1];
            for (int j = 0, k = 0; j < levels.length; j++) {
                if (j != i) {
                    modifiedLevels[k++] = levels[j];
                }
            }

            if (isSafe(modifiedLevels)) {
                return true;
            }
        }
        return false;
    }
}
