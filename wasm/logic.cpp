#include <string>
#include <sstream>
#include <vector>
#include <emscripten/bind.h>

int wordCount(const std::string& text) {
    std::istringstream stream(text);
    std::vector<std::string> words;
    std::string word;
    while (stream >> word) {
        words.push_back(word);
    }
    return words.size();
}

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("wordCount", &wordCount);
}