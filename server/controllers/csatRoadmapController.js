const CSATRoadmap = require('../models/CSATRoadmap');

// Helper: difference in calendar days between two dates
const diffInDays = (a, b) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utcA - utcB) / msPerDay);
};

// Helper: add days to a date
const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

// Helper: compute roadmap status from raw data
const computeStatus = (roadmap) => {
    const today = new Date();
    const start = new Date(roadmap.planStartDate);
    const targetEnd = new Date(roadmap.targetEndDate);

    const calendarElapsed = Math.max(0, diffInDays(today, start) + 1); // +1 because start date is Day 1
    const completedCount = roadmap.completedDays.length;
    const lagDays = Math.max(0, calendarElapsed - completedCount);

    // First uncompleted day
    const completedSet = new Set(roadmap.completedDays.map(d => d.dayNumber));
    let currentDay = 1;
    while (completedSet.has(currentDay) && currentDay <= 112) currentDay++;

    const projectedFinish = addDays(targetEnd, lagDays);

    // Week and month for currentDay
    const currentWeek = Math.min(16, Math.ceil(currentDay / 7));
    const currentMonth = currentDay <= 28 ? 1 : currentDay <= 56 ? 2 : currentDay <= 84 ? 3 : 4;

    // Weeks fully cleared (all 7 days in the week are complete)
    let weeksClear = 0;
    for (let w = 1; w <= 16; w++) {
        const weekStart = (w - 1) * 7 + 1;
        const weekEnd = Math.min(w * 7, 112);
        let allDone = true;
        for (let d = weekStart; d <= weekEnd; d++) {
            if (!completedSet.has(d)) { allDone = false; break; }
        }
        if (allDone) weeksClear++;
    }

    const hoursInvested = parseFloat((completedCount * 1.5).toFixed(1));
    const progressPct = Math.round((completedCount / 112) * 100);

    return {
        currentDay: currentDay > 112 ? 112 : currentDay,
        completedCount,
        totalDays: 112,
        lagDays,
        isOnTrack: lagDays === 0,
        isCompleted: completedCount >= 112,
        projectedFinish: projectedFinish.toISOString().split('T')[0],
        originalDeadline: targetEnd.toISOString().split('T')[0],
        planStartDate: start.toISOString().split('T')[0],
        currentWeek,
        currentMonth,
        weeksClear,
        hoursInvested,
        totalHours: 168,
        progressPct,
        completedDays: roadmap.completedDays,
        skippedDates: roadmap.skippedDates
    };
};

// GET /api/csat-roadmap/progress
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        let roadmap = await CSATRoadmap.findOne({ userId });

        // Auto-initialize if none exists
        if (!roadmap) {
            roadmap = await CSATRoadmap.create({
                userId,
                planStartDate: new Date('2026-10-12'),
                targetEndDate: new Date('2027-01-31'),
                completedDays: [],
                skippedDates: []
            });
        }

        const status = computeStatus(roadmap);
        res.json(status);
    } catch (error) {
        console.error('Error getting CSAT roadmap progress:', error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/csat-roadmap/complete/:dayNumber
exports.completeDay = async (req, res) => {
    try {
        const userId = req.user.id;
        const dayNumber = parseInt(req.params.dayNumber, 10);

        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 112) {
            return res.status(400).json({ message: 'Day number must be between 1 and 112.' });
        }

        let roadmap = await CSATRoadmap.findOne({ userId });
        if (!roadmap) {
            roadmap = await CSATRoadmap.create({
                userId,
                planStartDate: new Date('2026-10-12'),
                targetEndDate: new Date('2027-01-31'),
                completedDays: [],
                skippedDates: []
            });
        }

        // Check if already completed
        const alreadyDone = roadmap.completedDays.find(d => d.dayNumber === dayNumber);
        if (alreadyDone) {
            return res.status(400).json({ message: `Day ${dayNumber} is already marked complete.` });
        }

        roadmap.completedDays.push({
            dayNumber,
            completedAt: new Date(),
            notes: req.body.notes || ''
        });

        await roadmap.save();

        const status = computeStatus(roadmap);
        res.json(status);
    } catch (error) {
        console.error('Error completing CSAT roadmap day:', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/csat-roadmap/uncomplete/:dayNumber — Undo a day completion
exports.uncompleteDay = async (req, res) => {
    try {
        const userId = req.user.id;
        const dayNumber = parseInt(req.params.dayNumber, 10);

        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 112) {
            return res.status(400).json({ message: 'Day number must be between 1 and 112.' });
        }

        const roadmap = await CSATRoadmap.findOne({ userId });
        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found.' });
        }

        roadmap.completedDays = roadmap.completedDays.filter(d => d.dayNumber !== dayNumber);
        await roadmap.save();

        const status = computeStatus(roadmap);
        res.json(status);
    } catch (error) {
        console.error('Error uncompleting CSAT roadmap day:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/csat-roadmap/skip
exports.skipDay = async (req, res) => {
    try {
        const userId = req.user.id;

        let roadmap = await CSATRoadmap.findOne({ userId });
        if (!roadmap) {
            roadmap = await CSATRoadmap.create({
                userId,
                planStartDate: new Date('2026-10-12'),
                targetEndDate: new Date('2027-01-31'),
                completedDays: [],
                skippedDates: []
            });
        }

        // Record today as a skipped date
        const todayStr = new Date().toISOString().split('T')[0];
        const alreadySkipped = roadmap.skippedDates.some(d =>
            new Date(d).toISOString().split('T')[0] === todayStr
        );
        if (!alreadySkipped) {
            roadmap.skippedDates.push(new Date());
        }

        await roadmap.save();

        const status = computeStatus(roadmap);
        res.json(status);
    } catch (error) {
        console.error('Error skipping CSAT roadmap day:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/csat-roadmap/reset
exports.resetRoadmap = async (req, res) => {
    try {
        const userId = req.user.id;

        const roadmap = await CSATRoadmap.findOneAndUpdate(
            { userId },
            {
                $set: {
                    planStartDate: new Date(),
                    targetEndDate: addDays(new Date(), 112),
                    completedDays: [],
                    skippedDates: []
                }
            },
            { upsert: true, new: true }
        );

        const status = computeStatus(roadmap);
        res.json(status);
    } catch (error) {
        console.error('Error resetting CSAT roadmap:', error);
        res.status(500).json({ message: error.message });
    }
};
