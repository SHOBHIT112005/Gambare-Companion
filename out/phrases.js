"use strict";
/**
 * phrases.ts — Japanese encouragement phrase database
 *
 * Each phrase includes the Japanese text (for TTS), an English translation
 * (for subtitle display), and the emotion state it maps to.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.idlePhrases = exports.fixedPhrases = exports.stuckPhrases = exports.errorPhrases = void 0;
exports.getRandomPhrase = getRandomPhrase;
// ─── Error Phrases (Worried State) ──────────────────────────────────────────
exports.errorPhrases = [
    {
        japanese: "大丈夫だよ！一緒に直そう！",
        english: "It's okay! Let's fix it together!",
        emotion: 'worried'
    },
    {
        japanese: "エラーが出ちゃった…でも大丈夫！",
        english: "An error appeared... but it's fine!",
        emotion: 'worried'
    },
    {
        japanese: "心配しないで！きっと直せるよ！",
        english: "Don't worry! You can definitely fix this!",
        emotion: 'worried'
    },
    {
        japanese: "ちょっとしたミスだよ、気にしないで！",
        english: "It's just a small mistake, don't worry about it!",
        emotion: 'worried'
    },
    {
        japanese: "バグは成長のチャンスだよ！",
        english: "Bugs are opportunities to grow!",
        emotion: 'worried'
    },
    {
        japanese: "一緒にデバッグしよう！",
        english: "Let's debug together!",
        emotion: 'worried'
    },
    {
        japanese: "落ち着いて、ゆっくり見てみよう！",
        english: "Stay calm, let's look at it slowly!",
        emotion: 'worried'
    },
    {
        japanese: "エラーは怖くないよ！私がいるから！",
        english: "Errors aren't scary! Because I'm here!",
        emotion: 'worried'
    }
];
// ─── Stuck/Idle Phrases (Encouraging State) ─────────────────────────────────
exports.stuckPhrases = [
    {
        japanese: "頑張って！あなたならできるよ！",
        english: "Do your best! You can do it!",
        emotion: 'encouraging'
    },
    {
        japanese: "休憩も大事だよ？少し休んでもいいんだよ！",
        english: "Rest is important too! It's okay to take a break!",
        emotion: 'encouraging'
    },
    {
        japanese: "考え中？いいね、じっくり考えよう！",
        english: "Thinking? Nice, let's think it through!",
        emotion: 'encouraging'
    },
    {
        japanese: "詰まっちゃった？一緒に考えよう！",
        english: "Stuck? Let's think about it together!",
        emotion: 'encouraging'
    },
    {
        japanese: "ファイトだよ！諦めないで！",
        english: "You got this! Don't give up!",
        emotion: 'encouraging'
    },
    {
        japanese: "深呼吸してリフレッシュしよう！",
        english: "Take a deep breath and refresh!",
        emotion: 'encouraging'
    },
    {
        japanese: "お水飲んだ？水分補給は大事だよ！",
        english: "Have you had water? Staying hydrated is important!",
        emotion: 'encouraging'
    },
    {
        japanese: "あなたのコード、いつもかっこいいよ！",
        english: "Your code is always so cool!",
        emotion: 'encouraging'
    }
];
// ─── Fixed Phrases (Happy State) ────────────────────────────────────────────
exports.fixedPhrases = [
    {
        japanese: "やったー！直ったよ！すごい！",
        english: "Yay! It's fixed! Amazing!",
        emotion: 'happy'
    },
    {
        japanese: "さすが！完璧だよ！",
        english: "As expected! Perfect!",
        emotion: 'happy'
    },
    {
        japanese: "えらい！よく頑張ったね！",
        english: "Great job! You worked so hard!",
        emotion: 'happy'
    },
    {
        japanese: "バグ退治完了！おつかれさま！",
        english: "Bug exterminated! Great work!",
        emotion: 'happy'
    },
    {
        japanese: "すごいすごい！天才だね！",
        english: "Amazing! You're a genius!",
        emotion: 'happy'
    },
    {
        japanese: "きれいなコードになったね！",
        english: "The code is so clean now!",
        emotion: 'happy'
    },
    {
        japanese: "最高！その調子で頑張って！",
        english: "Awesome! Keep up the great work!",
        emotion: 'happy'
    },
    {
        japanese: "問題解決！あなたは最高のプログラマーだよ！",
        english: "Problem solved! You're the best programmer!",
        emotion: 'happy'
    }
];
// ─── Idle/Greeting Phrases ──────────────────────────────────────────────────
exports.idlePhrases = [
    {
        japanese: "今日も一緒に頑張ろうね！",
        english: "Let's do our best together today!",
        emotion: 'idle'
    },
    {
        japanese: "いい天気だね！コーディング日和！",
        english: "Nice weather! Perfect day for coding!",
        emotion: 'idle'
    },
    {
        japanese: "何か手伝えることある？",
        english: "Is there anything I can help with?",
        emotion: 'idle'
    },
    {
        japanese: "楽しくコーディングしようね！",
        english: "Let's have fun coding!",
        emotion: 'idle'
    }
];
/**
 * Pick a random phrase from the given array, avoiding the last used phrase.
 * Returns the selected phrase.
 */
const lastUsed = new Map();
function getRandomPhrase(phrases, category) {
    const lastIndex = lastUsed.get(category) ?? -1;
    let index;
    do {
        index = Math.floor(Math.random() * phrases.length);
    } while (index === lastIndex && phrases.length > 1);
    lastUsed.set(category, index);
    return phrases[index];
}
//# sourceMappingURL=phrases.js.map