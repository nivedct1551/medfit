function calculateWeeklyInsight(entries) {
    if (!entries || entries.length === 0) return "Not enough data this week to provide an insight.";

    let lowDays = 0;
    let happyDays = 0;

    entries.forEach(entry => {
        if (entry.moodLevel <= 2) lowDays++;
        else if (entry.moodLevel >= 4) happyDays++;
    });

    if (lowDays >= 3) return `You felt low ${lowDays} days this week. Remember to take it easy.`;
    if (happyDays >= 3) return `You were mostly happy this week! Keep the positive energy going.`;
    return "Your mood remained mostly neutral or balanced this week.";
}

module.exports = { calculateWeeklyInsight };
