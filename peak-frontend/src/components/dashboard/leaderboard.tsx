
export default function ViewLeaderBoard () {
    const leaderboard_pos = 67
    const xp_earned = 41
    return (
        <div className="bg-white p-6 border border-gray-300 rounded-xl shadow w-[500px]">
            <div className="flex gap-30">
                <div className="flex items-center text-4xl font-bold">
                    <h2>{leaderboard_pos}</h2>
                </div>
                <div className="inline-block">
                    <h2 className="font-extrabold">View Leaderboard</h2>
                    <h2>You're ranked #{leaderboard_pos}</h2>
                    <h2 className="font-light">You have earned {xp_earned} XP this week.</h2>
                </div>
            </div>
        </div>
    )
}