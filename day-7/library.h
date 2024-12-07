#ifndef DAY_7_LIBRARY_H
#define DAY_7_LIBRARY_H
#include <string>
#include <vector>
using namespace std;

struct MappedCollection {
    int target;
    string expression;
};


string readInput(const char *fileName);
vector<MappedCollection> getCollection(string &input_data);
vector<string> splitter(const string &in_pattern, string& content);
bool evaluateExpression(const vector<int> &numbers, int target, const vector<string> &operators);
int tryCalculate(const vector<MappedCollection> &collection);

#endif //DAY_7_LIBRARY_H