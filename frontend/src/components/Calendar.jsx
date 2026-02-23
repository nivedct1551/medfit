import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

const moodEmojis = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '😁' };

export default function Calendar({ entries, onDateClick }) {
    const currentDate = new Date();
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Map entries by YYYY-MM-DD
    const entriesMap = entries.reduce((acc, entry) => {
        acc[entry.date] = entry;
        return acc;
    }, {});

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Pad the start of the month with empty cells based on starting weekday
    const startDay = start.getDay();
    const paddedDays = Array.from({ length: startDay }).map((_, i) => null);

    return (
        <div className="w-full">
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
                {weekDays.map(day => (
                    <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {paddedDays.map((_, i) => <div key={`empty-${i}`} className="p-2 h-16 md:h-24"></div>)}

                {days.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const entry = entriesMap[dateStr];
                    const hasEntry = !!entry;
                    const isCurrentDay = isToday(date);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateClick(dateStr)}
                            className={`
                relative h-16 md:h-24 p-1 md:p-2 rounded-xl transition-all border 
                flex flex-col items-center justify-start md:justify-center
                hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200
                ${hasEntry ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}
                ${isCurrentDay ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-white border-transparent bg-white' : ''}
              `}
                        >
                            <span className={`text-xs font-semibold ${isCurrentDay ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {format(date, 'd')}
                            </span>

                            <div className="mt-1 md:mt-2 text-2xl md:text-3xl animate-pop-in">
                                {hasEntry ? moodEmojis[entry.moodLevel] : <span className="text-transparent">0</span>}
                            </div>

                            {entry?.note && (
                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
