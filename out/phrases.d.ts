/**
 * phrases.ts — Japanese encouragement phrase database
 *
 * Each phrase includes the Japanese text (for TTS), an English translation
 * (for subtitle display), and the emotion state it maps to.
 */
export interface Phrase {
    /** Japanese text spoken by the companion */
    japanese: string;
    /** English translation shown as subtitle */
    english: string;
    /** Character emotion state */
    emotion: 'worried' | 'encouraging' | 'happy' | 'idle' | 'excited' | 'shy' | 'embarrassed' | 'sad';
    /** Filename of the pre-recorded audio in media/voices/ */
    audioFile?: string;
}
export declare const errorPhrases: Phrase[];
export declare const stuckPhrases: Phrase[];
export declare const fixedPhrases: Phrase[];
export declare const idlePhrases: Phrase[];
export declare const excitedPhrases: Phrase[];
export declare const shyPhrases: Phrase[];
export declare const embarrassedPhrases: Phrase[];
export declare const sadPhrases: Phrase[];
export declare function getRandomPhrase(phrases: Phrase[], category: string): Phrase;
//# sourceMappingURL=phrases.d.ts.map