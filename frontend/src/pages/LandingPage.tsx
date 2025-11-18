const LandingPage = () => {
    const features = [
        {title: "Learn exercises", body: "Follow step-by-step instructions with a visual guide.", emoji: "🦾"},
        {title: "Track your meals", body: "See how each meal contributes to your daily allowance.", emoji: "🫐"},
        {title: "Build healthy habits", body: "Stay consistent with streaks and daily & weekly challenges.", emoji: "🔥"},
        {title: "Progress", body: "Keep track of previous workouts, weight, sets, and reps.", emoji: "📈"},
        {title: "Leaderboard", body: "See how your efforts compare and climb the ranks.", emoji: "🏆"}
    ];

    return (
        <>
            <div className="max-w-6xl mx-auto px-4 pb-20 pt-24">
                <section className="flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
                    <div className="flex-1">
                        <div className="border border-gray-400 rounded-xl aspect-[4/3] flex items-center justify-center">
                            <span>To be replaced.</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl lg:text-4xl font-semibold leading-tight">
                            <span className="block">Track your workouts.</span>
                            <span className="block">Track your macros.</span>
                            <span className="block">Build discipline.</span>
                            <span className="block">Reach your PEAK.</span>
                        </h1>

                        <p className="mt-4 text-sm md:text-base text-gray-300 max-w-md">
                            A fun and simple way to track your fitness and nutritional goals. Learn exercises, build routines, and stay consistent.
                        </p>
                    </div>
                </section>

                <section className="mt-16">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                        {features.map((card) => (
                            <div key={card.title} className="rounded-2xl border border-gray-500 bg-[#1b1b1b] px-4 py-5 flex flex-col justify-between shadow-md">
                                <div className="text-3xl px-1 py-1">
                                    {card.emoji}
                                </div>
                                <h3 className="font-semibold mb-1 text-sm md:text-base">
                                    {card.title}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-300">
                                    {card.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-24">
                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map((box) => (
                            <div key={box} className="border border-gray-400 bg-[#2a2a2a] rounded-xl aspect-[4/3]"></div>
                        ))}
                    </div>
                </section>

                <section className="mt-20 text-center">
                    <h3 className="text-2xl md:text-3xl mb-3">
                        Ready to work towards your PEAK?
                    </h3>

                    <p className="text-sm md:text-base text-gray-300 mb-6">
                        Start changing your life today.
                    </p>
                </section>
            </div>
        </>
    );
};

export default LandingPage;