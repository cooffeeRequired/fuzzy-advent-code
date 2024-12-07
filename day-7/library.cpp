#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <regex>
#include <functional>
#include <iterator>

using namespace std;

struct MappedCollection {
    long long target;
    string expression;
};

string readInput(const char *fileName) {
    const string fullPath = string("resources/") + fileName;
    ifstream readFile(fullPath, ios_base::in | ios_base::binary);
    if (!readFile) {
        return "";
    }
    ostringstream buffer;
    buffer << readFile.rdbuf();
    return buffer.str();
}

vector<string> splitter(const string &in_pattern, const string &content) {
    vector<string> split_content;
    const regex pattern(in_pattern);
    copy(sregex_token_iterator(content.begin(), content.end(), pattern, -1),
         sregex_token_iterator(),
         back_inserter(split_content));

    split_content.erase(remove_if(split_content.begin(), split_content.end(),
                                  [](const string &s) { return s.empty(); }),
                        split_content.end());
    return split_content;
}

vector<MappedCollection> getCollection(const string &input_data) {
    const vector<string> lines = splitter("\n", input_data);
    vector<MappedCollection> result;
    for (const auto &line : lines) {
        if (line.empty()) continue;
        const vector<string> split = splitter(":", line);
        if (split.size() != 2) continue;
        const long long num = stoll(split[0]);
        const string &expression = split[1];
        result.push_back({num, expression});
    }
    return result;
}

bool evaluateExpression(const vector<long long> &numbers, const long long target, const vector<string> &operators) {
    function<bool(int, long long)> evaluateExpressionHelper = [&](const int index, const long long currentV) -> bool {
        if (index == numbers.size()) return currentV == target;
        for (const auto &op : operators) {
            long long nextV = currentV;
            if (op == "+") nextV += numbers[index];
            else if (op == "*") nextV *= numbers[index];
            else if (op == "||") nextV = stoll(to_string(nextV) + to_string(numbers[index]));
            if (evaluateExpressionHelper(index + 1, nextV)) {
                return true;
            }
        }
        return false;
    };
    return evaluateExpressionHelper(1, numbers[0]);
}

long long tryCalculate(const vector<MappedCollection> &collection) {
    const vector<string> operators = {"+", "*", "||"};
    long long totalResult = 0;
    for (const auto &[target, expression] : collection) {
        const vector<string> numStrings = splitter(" ", expression);
        vector<long long> numbers;
        numbers.reserve(numStrings.size());

        for (const auto &numStr : numStrings) {
            numbers.push_back(stoll(numStr));
        }
        if (evaluateExpression(numbers, target, operators)) {
            totalResult += target;
        }
    }
    return totalResult;
}

int main() {
    const string input_file = readInput("real");
    if (input_file.empty()) {
        cerr << "Failed to read the input file!" << endl;
        return 1;
    }
    const vector<MappedCollection> mapped = getCollection(input_file);
    const long long totalResult = tryCalculate(mapped);
    cout << "Total result: " << totalResult << endl;
    return 0;
}
