"use strict";
exports.__esModule = true;
exports.isButtonsPushed = exports.disagrees = void 0;
function disagrees(character, state, recentActionLearned, desireablesAffected) {
    return character.shoulds.filter(function (should) { });
}
exports.disagrees = disagrees;
function isButtonsPushed(character, state, recentActionLearned, desireablesAffected) {
    return character.shoulds.filter(function (should) { }).length > 0;
}
exports.isButtonsPushed = isButtonsPushed;
