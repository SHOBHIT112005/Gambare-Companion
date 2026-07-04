"use strict";
/**
 * phrases.ts — Japanese encouragement phrase database
 *
 * Each phrase includes the Japanese text (for TTS), an English translation
 * (for subtitle display), and the emotion state it maps to.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sadPhrases = exports.embarrassedPhrases = exports.shyPhrases = exports.excitedPhrases = exports.idlePhrases = exports.fixedPhrases = exports.stuckPhrases = exports.errorPhrases = void 0;
exports.getRandomPhrase = getRandomPhrase;
// ─── Error Phrases (Worried State) ──────────────────────────────────────────
exports.errorPhrases = [
    {
        japanese: "大丈夫だよ！一緒に直そう！",
        english: "It's okay! Let's fix it together!",
        emotion: 'worried',
        audioFile: 'worried_1.mp3'
    },
    {
        japanese: "エラーが出ちゃった…でも大丈夫！",
        english: "An error appeared... but it's fine!",
        emotion: 'worried',
        audioFile: 'worried_2.mp3'
    },
    {
        japanese: "心配しないで！きっと直せるよ！",
        english: "Don't worry! You can definitely fix this!",
        emotion: 'worried',
        audioFile: 'worried_3.mp3'
    },
    {
        japanese: "ちょっとしたミスだよ、気にしないで！",
        english: "It's just a small mistake, don't worry about it!",
        emotion: 'worried',
        audioFile: 'worried_4.mp3'
    },
    {
        japanese: "バグは成長のチャンスだよ！",
        english: "Bugs are opportunities to grow!",
        emotion: 'worried',
        audioFile: 'worried_5.mp3'
    },
    {
        japanese: "一緒にデバッグしよう！",
        english: "Let's debug together!",
        emotion: 'worried',
        audioFile: 'worried_6.mp3'
    },
    {
        japanese: "落ち着いて、ゆっくり見てみよう！",
        english: "Stay calm, let's look at it slowly!",
        emotion: 'worried',
        audioFile: 'worried_7.mp3'
    },
    {
        japanese: "エラーは怖くないよ！私がいるから！",
        english: "Errors aren't scary! Because I'm here!",
        emotion: 'worried',
        audioFile: 'worried_8.mp3'
    }
];
// ─── Stuck/Idle Phrases (Encouraging State) ─────────────────────────────────
exports.stuckPhrases = [
    {
        japanese: "頑張って！あなたならできるよ！",
        english: "Do your best! You can do it!",
        emotion: 'encouraging',
        audioFile: 'encouraging_1.mp3'
    },
    {
        japanese: "休憩も大事だよ？少し休んでもいいんだよ！",
        english: "Rest is important too! It's okay to take a break!",
        emotion: 'encouraging',
        audioFile: 'encouraging_2.mp3'
    },
    {
        japanese: "考え中？いいね、じっくり考えよう！",
        english: "Thinking? Nice, let's think it through!",
        emotion: 'encouraging',
        audioFile: 'encouraging_3.mp3'
    },
    {
        japanese: "詰まっちゃった？一緒に考えよう！",
        english: "Stuck? Let's think about it together!",
        emotion: 'encouraging',
        audioFile: 'encouraging_4.mp3'
    },
    {
        japanese: "ファイトだよ！諦めないで！",
        english: "You got this! Don't give up!",
        emotion: 'encouraging',
        audioFile: 'encouraging_5.mp3'
    },
    {
        japanese: "深呼吸してリフレッシュしよう！",
        english: "Take a deep breath and refresh!",
        emotion: 'encouraging',
        audioFile: 'encouraging_6.mp3'
    },
    {
        japanese: "お水飲んだ？水分補給は大事だよ！",
        english: "Have you had water? Staying hydrated is important!",
        emotion: 'encouraging',
        audioFile: 'encouraging_7.mp3'
    },
    {
        japanese: "あなたのコード、いつもかっこいいよ！",
        english: "Your code is always so cool!",
        emotion: 'encouraging',
        audioFile: 'encouraging_8.mp3'
    }
];
// ─── Fixed Phrases (Happy State) ────────────────────────────────────────────
exports.fixedPhrases = [
    {
        japanese: "やったー！直ったよ！すごい！",
        english: "Yay! It's fixed! Amazing!",
        emotion: 'happy',
        audioFile: 'happy_1.mp3'
    },
    {
        japanese: "さすが！完璧だよ！",
        english: "As expected! Perfect!",
        emotion: 'happy',
        audioFile: 'happy_2.mp3'
    },
    {
        japanese: "えらい！よく頑張ったね！",
        english: "Great job! You worked so hard!",
        emotion: 'happy',
        audioFile: 'happy_3.mp3'
    },
    {
        japanese: "バグ退治完了！おつかれさま！",
        english: "Bug exterminated! Great work!",
        emotion: 'happy',
        audioFile: 'happy_4.mp3'
    },
    {
        japanese: "すごいすごい！天才だね！",
        english: "Amazing! You're a genius!",
        emotion: 'happy',
        audioFile: 'happy_5.mp3'
    },
    {
        japanese: "きれいなコードになったね！",
        english: "The code is so clean now!",
        emotion: 'happy',
        audioFile: 'happy_6.mp3'
    },
    {
        japanese: "最高！その調子で頑張って！",
        english: "Awesome! Keep up the great work!",
        emotion: 'happy',
        audioFile: 'happy_7.mp3'
    },
    {
        japanese: "問題解決！あなたは最高のプログラマーだよ！",
        english: "Problem solved! You're the best programmer!",
        emotion: 'happy',
        audioFile: 'happy_8.mp3'
    }
];
// ─── Idle/Greeting Phrases ──────────────────────────────────────────────────
exports.idlePhrases = [
    {
        japanese: "今日も一緒に頑張ろうね！",
        english: "Let's do our best together today!",
        emotion: 'idle',
        audioFile: 'idle_1.mp3'
    },
    {
        japanese: "いい天気だね！コーディング日和！",
        english: "Nice weather! Perfect day for coding!",
        emotion: 'idle',
        audioFile: 'idle_2.mp3'
    },
    {
        japanese: "何か手伝えることある？",
        english: "Is there anything I can help with?",
        emotion: 'idle',
        audioFile: 'idle_3.mp3'
    },
    {
        japanese: "楽しくコーディングしようね！",
        english: "Let's have fun coding!",
        emotion: 'idle',
        audioFile: 'idle_4.mp3'
    }
];
// ─── Excited Phrases (Super Happy State) ────────────────────────────────────
exports.excitedPhrases = [
    {
        japanese: "きゃー！すごすぎるー！最高だよ！",
        english: "Kyaa! That's so amazing! The best!",
        emotion: 'excited',
        audioFile: 'excited_1.mp3'
    },
    {
        japanese: "うわぁ！天才！天才すぎる！！",
        english: "Woah! Genius! You're too much of a genius!!",
        emotion: 'excited',
        audioFile: 'excited_2.mp3'
    },
    {
        japanese: "やばい！かっこよすぎ！鳥肌立った！",
        english: "OMG! So cool! I got goosebumps!",
        emotion: 'excited',
        audioFile: 'excited_3.mp3'
    },
    {
        japanese: "すっごーい！もう感動しちゃった！",
        english: "So amazing! I'm already moved to tears!",
        emotion: 'excited',
        audioFile: 'excited_4.mp3'
    },
    {
        japanese: "完璧すぎて泣きそう！最高！！",
        english: "So perfect I could cry! The absolute best!!",
        emotion: 'excited',
        audioFile: 'excited_5.mp3'
    },
    {
        japanese: "神！あなたは神プログラマーだよ！",
        english: "A god! You're a god-tier programmer!",
        emotion: 'excited',
        audioFile: 'excited_6.mp3'
    }
];
// ─── Shy Phrases (Character Click — Shy Reaction) ───────────────────────────
exports.shyPhrases = [
    {
        japanese: "え…私のこと見てるの…？えへへ",
        english: "Eh... are you looking at me...? Ehehe",
        emotion: 'shy',
        audioFile: 'shy_1.mp3'
    },
    {
        japanese: "あ、あんまり見つめないで…照れちゃう…",
        english: "D-don't stare too much... I'll get flustered...",
        emotion: 'shy',
        audioFile: 'shy_2.mp3'
    },
    {
        japanese: "な、なに？何か用？…べつに嬉しくないよ",
        english: "W-what? Need something? ...It's not like I'm happy",
        emotion: 'shy',
        audioFile: 'shy_3.mp3'
    },
    {
        japanese: "そ、そんなにクリックしないで…！",
        english: "D-don't click on me so much...!",
        emotion: 'shy',
        audioFile: 'shy_4.mp3'
    },
    {
        japanese: "えっと…あの…一緒にいてくれて嬉しいな",
        english: "Um... well... I'm happy you're here with me",
        emotion: 'shy',
        audioFile: 'shy_5.mp3'
    },
    {
        japanese: "も、もう！ドキドキしちゃうでしょ！",
        english: "Geez! You're making my heart race!",
        emotion: 'shy',
        audioFile: 'shy_6.mp3'
    }
];
// ─── Embarrassed Phrases (Click Reaction — Flustered) ───────────────────────
exports.embarrassedPhrases = [
    {
        japanese: "ひゃっ！び、びっくりした！急に触らないで！",
        english: "Hyaa! Y-you startled me! Don't touch suddenly!",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_1.mp3'
    },
    {
        japanese: "ちょ、ちょっと！何してるの！？",
        english: "W-wait! What are you doing!?",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_2.mp3'
    },
    {
        japanese: "う、うわぁ…顔が熱い…見ないで！",
        english: "U-uwaa... my face is hot... don't look!",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_3.mp3'
    },
    {
        japanese: "も、もう！変なことしないでよ！…ばか",
        english: "Geez! Don't do weird things! ...dummy",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_4.mp3'
    },
    {
        japanese: "え！？な、なんでもないよ！何でもない！",
        english: "Eh!? I-it's nothing! Nothing at all!",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_5.mp3'
    },
    {
        japanese: "あわわ…心臓止まるかと思った…",
        english: "Awawawa... I thought my heart would stop...",
        emotion: 'embarrassed',
        audioFile: 'embarrassed_6.mp3'
    }
];
// ─── Sad Phrases (Prolonged Idle — Missing the User) ────────────────────────
exports.sadPhrases = [
    {
        japanese: "さみしいよ…どこ行っちゃったの…？",
        english: "I'm lonely... where did you go...?",
        emotion: 'sad',
        audioFile: 'sad_1.mp3'
    },
    {
        japanese: "帰ってきて…一人は寂しいよ…",
        english: "Come back... it's lonely being alone...",
        emotion: 'sad',
        audioFile: 'sad_2.mp3'
    },
    {
        japanese: "もう忘れちゃったのかな…私のこと…",
        english: "Have you already forgotten... about me...?",
        emotion: 'sad',
        audioFile: 'sad_3.mp3'
    },
    {
        japanese: "ずっと待ってるよ…だから…戻ってきてね",
        english: "I'll keep waiting... so... please come back",
        emotion: 'sad',
        audioFile: 'sad_4.mp3'
    },
    {
        japanese: "コード書かないの…？一緒に頑張りたいな…",
        english: "Not coding...? I want to work hard together...",
        emotion: 'sad',
        audioFile: 'sad_5.mp3'
    },
    {
        japanese: "大丈夫かな…心配だよ…",
        english: "Are you okay...? I'm worried...",
        emotion: 'sad',
        audioFile: 'sad_6.mp3'
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