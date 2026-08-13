const db = require('./src/lib/db');

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

const seedCasinos = [
    {
        name: 'Stake',
        referral_url: 'https://stake.us/?c=qfRRRydF',
        description: `Stake.us offers around 1 SC every day through its daily reward. Once you've accumulated enough SC to meet the minimum redemption threshold, typically around 30–40 SC, you can request a redemption.

One of the biggest advantages is that the daily SC doesn't require you to play it through before redeeming. You can simply collect your daily rewards, build up your balance, and redeem once you meet the required threshold and other eligibility requirements.`
    },
    {
        name: 'RealPrize',
        referral_url: 'https://realprize.com/refer/995156',
        description: `RealPrize offers around 0.40 SC each day through its daily reward. However, it also frequently sends out email promotions, which can add another 1 SC or more depending on the promotion.

RealPrize also runs free spin promotions, giving you additional opportunities to win SC without making a purchase. Some of these promotions can even have prizes of up to 50 SC. I've personally hit the 50 SC jackpot several times, making these promotions worth checking regularly.`
    },
    {
        name: 'CrownCoinsCasino',
        referral_url: 'https://crowncoinscasino.com/?utm_campaign=6709c517-3553-4483-9486-8586d06db5c8&utm_source=friends',
        description: `CrownCoins Casino offers around 1 SC per day through its daily rewards. In addition to the daily login bonus, CrownCoins may also send email promotions that can provide around 1 SC every 1–2 days.

That means there can be multiple opportunities to collect free SC throughout the week. Make sure to check both the casino and your email regularly so you don't miss any available promotions.`
    },
    {
        name: 'LoneStar',
        referral_url: 'https://lonestarcasino.com/refer/1159320',
        description: `LoneStar Casino is similar to RealPrize and is owned by the same company, so you'll notice a lot of similarities between the two platforms.

It offers daily rewards along with additional promotional opportunities through email offers and free spin promotions. If you're already checking RealPrize regularly, it's worth adding LoneStar to your daily routine as well so you don't miss any of the extra SC opportunities.`
    },
    {
        name: 'ZulaCasino',
        referral_url: 'https://www.zulacasino.com/signup/ca8a8054-e64f-4c39-a32d-685109449b06',
        description: `Zula Casino offers around 1 SC each day through its daily reward. You can continue collecting your free SC until you reach the minimum redemption threshold of 50 SC.`
    },
    {
        name: 'Pulsz',
        referral_url: 'https://www.pulsz.com/?invited_by=z1q1re',
        description: `Pulsz offers daily rewards that average around 0.70 SC per day, giving you another easy way to build up your balance over time.

Pulsz also has a weekly spinner available from Friday through Sunday, where you can spin for additional rewards, including SC and free spins. I recommend checking in during the weekend so you don't miss the weekly spinner.`
    }
];

db.serialize(() => {
    seedCasinos.forEach(c => {
        const id = generateId();
        db.run(
            `INSERT INTO casinos (id, name, description, show_on_top_sites, referral_url) VALUES (?, ?, ?, ?, ?)`,
            [id, c.name, c.description, 1, c.referral_url],
            function(err) {
                if (err) {
                    console.error("Error inserting", c.name, err);
                } else {
                    console.log("Inserted", c.name);
                }
            }
        );
    });
});
