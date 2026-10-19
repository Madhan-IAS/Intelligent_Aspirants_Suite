/**
 * Quick fix: merge "Indian Economy" into "Economy" tab
 * The 256 new Ramesh Singh topics were seeded with subjectName: "Indian Economy"
 * but existing topics use subjectName: "Economy". This merges them.
 */
const mongoose = require("mongoose");
const Topic = require("./models/Topic");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const result = await Topic.updateMany(
        { subjectName: "Indian Economy" },
        { $set: { subjectName: "Economy" } }
    );
    console.log("Updated", result.modifiedCount, "topics: Indian Economy -> Economy");

    const totalEconomy = await Topic.countDocuments({ subjectName: "Economy" });
    console.log("Total Economy topics now:", totalEconomy);

    process.exit(0);
}).catch(err => {
    console.error("Error:", err.message);
    process.exit(1);
});
