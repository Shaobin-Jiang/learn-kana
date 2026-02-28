const { createApp } = Vue;

const KANA_LIST = [
  { romaji: "a", hira: "あ", kata: "ア" },
  { romaji: "i", hira: "い", kata: "イ" },
  { romaji: "u", hira: "う", kata: "ウ" },
  { romaji: "e", hira: "え", kata: "エ" },
  { romaji: "o", hira: "お", kata: "オ" },
  { romaji: "ka", hira: "か", kata: "カ" },
  { romaji: "ki", hira: "き", kata: "キ" },
  { romaji: "ku", hira: "く", kata: "ク" },
  { romaji: "ke", hira: "け", kata: "ケ" },
  { romaji: "ko", hira: "こ", kata: "コ" },
  { romaji: "sa", hira: "さ", kata: "サ" },
  { romaji: "shi", hira: "し", kata: "シ" },
  { romaji: "su", hira: "す", kata: "ス" },
  { romaji: "se", hira: "せ", kata: "セ" },
  { romaji: "so", hira: "そ", kata: "ソ" },
  { romaji: "ta", hira: "た", kata: "タ" },
  { romaji: "chi", hira: "ち", kata: "チ" },
  { romaji: "tsu", hira: "つ", kata: "ツ" },
  { romaji: "te", hira: "て", kata: "テ" },
  { romaji: "to", hira: "と", kata: "ト" },
  { romaji: "na", hira: "な", kata: "ナ" },
  { romaji: "ni", hira: "に", kata: "ニ" },
  { romaji: "nu", hira: "ぬ", kata: "ヌ" },
  { romaji: "ne", hira: "ね", kata: "ネ" },
  { romaji: "no", hira: "の", kata: "ノ" },
  { romaji: "ha", hira: "は", kata: "ハ" },
  { romaji: "hi", hira: "ひ", kata: "ヒ" },
  { romaji: "fu", hira: "ふ", kata: "フ" },
  { romaji: "he", hira: "へ", kata: "ヘ" },
  { romaji: "ho", hira: "ほ", kata: "ホ" },
  { romaji: "ma", hira: "ま", kata: "マ" },
  { romaji: "mi", hira: "み", kata: "ミ" },
  { romaji: "mu", hira: "む", kata: "ム" },
  { romaji: "me", hira: "め", kata: "メ" },
  { romaji: "mo", hira: "も", kata: "モ" },
  { romaji: "ya", hira: "や", kata: "ヤ" },
  { romaji: "yu", hira: "ゆ", kata: "ユ" },
  { romaji: "yo", hira: "よ", kata: "ヨ" },
  { romaji: "ra", hira: "ら", kata: "ラ" },
  { romaji: "ri", hira: "り", kata: "リ" },
  { romaji: "ru", hira: "る", kata: "ル" },
  { romaji: "re", hira: "れ", kata: "レ" },
  { romaji: "ro", hira: "ろ", kata: "ロ" },
  { romaji: "wa", hira: "わ", kata: "ワ" },
  { romaji: "wo", hira: "を", kata: "ヲ" },
  { romaji: "n", hira: "ん", kata: "ン" }
];

const DEFAULT_SEQUENCE = `const select_count = 15;
const repeat_count = 3;
let base = ${JSON.stringify(
  KANA_LIST.map((item) => item.romaji)
)};
let repeated = [];
for (let n = 0; n < repeat_count; n++) {
    let selected = base.slice(0, select_count);
    for (let i = selected.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]];
    }
    repeated = repeated.concat(selected);
}
console.log(repeated)
return repeated;`;

const STORAGE_KEYS = {
  romaji: "romaji-kana-sequence-code",
  kana: "kana-romaji-sequence-code"
};

createApp({
  data() {
    return {
      activeTab: "reference",
      kanaList: KANA_LIST,
      tableRows: [],
      showAnswer: false,
      currentRomajiIndex: 0,
      romajiSequenceCode: DEFAULT_SEQUENCE,
      romajiSequenceOrder: [],
      romajiSequencePos: 0,
      romajiSequenceError: "",
      currentKanaIndex: 0,
      currentKanaScript: "hira",
      romajiInput: "",
      romajiFeedback: null,
      kanaSequenceCode: DEFAULT_SEQUENCE,
      kanaSequenceOrder: [],
      kanaSequencePos: 0,
      kanaSequenceError: "",
      autoNextTimer: null
    };
  },
  computed: {
    currentRomaji() {
      return this.kanaList[this.currentRomajiIndex];
    },
    currentKana() {
      const item = this.kanaList[this.currentKanaIndex];
      return {
        romaji: item.romaji,
        display: this.currentKanaScript === "hira" ? item.hira : item.kata
      };
    },
    romajiProgress() {
      const total = this.romajiSequenceOrder.length || this.kanaList.length;
      const position =
        (this.romajiSequenceOrder.length ? this.romajiSequencePos : 0) + 1;
      return `${position} / ${total}`;
    },
    kanaProgress() {
      const total = this.kanaSequenceOrder.length || this.kanaList.length;
      const position =
        (this.kanaSequenceOrder.length ? this.kanaSequencePos : 0) + 1;
      return `${position} / ${total}`;
    }
  },
  created() {
    this.buildTable();
    this.romajiSequenceOrder = this.kanaList.map((_, index) => index);
    this.kanaSequenceOrder = this.kanaList.map((_, index) => index);

    const storedRomaji = localStorage.getItem(STORAGE_KEYS.romaji);
    if (storedRomaji) {
      this.romajiSequenceCode = storedRomaji;
    }

    const storedKana = localStorage.getItem(STORAGE_KEYS.kana);
    if (storedKana) {
      this.kanaSequenceCode = storedKana;
    }

    this.applySequence("romaji");
    this.applySequence("kana");
    this.resetRomajiQuiz();
    this.resetKanaQuiz();
  },
  methods: {
    buildTable() {
      const rows = [
        ["a", "i", "u", "e", "o"],
        ["ka", "ki", "ku", "ke", "ko"],
        ["sa", "shi", "su", "se", "so"],
        ["ta", "chi", "tsu", "te", "to"],
        ["na", "ni", "nu", "ne", "no"],
        ["ha", "hi", "fu", "he", "ho"],
        ["ma", "mi", "mu", "me", "mo"],
        ["ya", "yu", "yo"],
        ["ra", "ri", "ru", "re", "ro"],
        ["wa", "wo", "n"]
      ];
      const lookup = new Map(this.kanaList.map((item) => [item.romaji, item]));
      this.tableRows = rows.map((row) => {
        const padded = [...row];
        while (padded.length < 5) {
          padded.push("");
        }
        return padded.map((romaji) =>
          romaji
            ? lookup.get(romaji)
            : { romaji: "", hira: "", kata: "" }
        );
      });
    },
    compileSequence(code) {
      try {
        const fn = new Function(code);
        const result = fn();
        if (!Array.isArray(result) || result.length === 0) {
          throw new Error("Sequence must return a non-empty array of romaji strings.");
        }
        const lookup = new Map(
          this.kanaList.map((item, index) => [item.romaji, index])
        );
        const order = [];
        for (const entry of result) {
          if (typeof entry !== "string") {
            throw new Error("Sequence array must contain romaji strings.");
          }
          const normalized = entry.trim().toLowerCase();
          if (!lookup.has(normalized)) {
            throw new Error(`Unknown romaji: ${entry}`);
          }
          order.push(lookup.get(normalized));
        }
        return { ok: true, order };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    },
    applySequence(kind) {
      const code =
        kind === "romaji" ? this.romajiSequenceCode : this.kanaSequenceCode;
      const result = this.compileSequence(code);
      if (!result.ok) {
        if (kind === "romaji") {
          this.romajiSequenceError = result.error;
        } else {
          this.kanaSequenceError = result.error;
        }
        return false;
      }

      if (kind === "romaji") {
        this.romajiSequenceOrder = result.order;
        this.romajiSequencePos = 0;
        this.currentRomajiIndex = result.order[0];
        this.romajiSequenceError = "";
        this.showAnswer = false;
        localStorage.setItem(STORAGE_KEYS.romaji, code);
      } else {
        this.kanaSequenceOrder = result.order;
        this.kanaSequencePos = 0;
        this.currentKanaIndex = result.order[0];
        this.kanaSequenceError = "";
        this.currentKanaScript = Math.random() < 0.5 ? "hira" : "kata";
        this.romajiInput = "";
        this.romajiFeedback = null;
        this.clearAutoNext();
        localStorage.setItem(STORAGE_KEYS.kana, code);
      }

      return true;
    },
    resetSequence(kind) {
      if (kind === "romaji") {
        this.romajiSequenceCode = DEFAULT_SEQUENCE;
      } else {
        this.kanaSequenceCode = DEFAULT_SEQUENCE;
      }
      this.applySequence(kind);
    },
    resetRomajiQuiz() {
      this.currentRomajiIndex = this.romajiSequenceOrder[0] ?? 0;
      this.romajiSequencePos = 0;
      this.showAnswer = false;
    },
    resetKanaQuiz() {
      this.currentKanaIndex = this.kanaSequenceOrder[0] ?? 0;
      this.kanaSequencePos = 0;
      this.currentKanaScript = Math.random() < 0.5 ? "hira" : "kata";
      this.romajiInput = "";
      this.romajiFeedback = null;
      this.clearAutoNext();
    },
    advanceSequence(kind) {
      const order =
        kind === "romaji" ? this.romajiSequenceOrder : this.kanaSequenceOrder;
      if (!order.length) {
        return 0;
      }
      if (kind === "romaji") {
        this.romajiSequencePos =
          (this.romajiSequencePos + 1) % order.length;
        return order[this.romajiSequencePos];
      }
      this.kanaSequencePos = (this.kanaSequencePos + 1) % order.length;
      return order[this.kanaSequencePos];
    },
    nextRomaji() {
      if (!this.showAnswer) {
        return;
      }
      this.currentRomajiIndex = this.advanceSequence("romaji");
      this.showAnswer = false;
    },
    nextKana() {
      this.clearAutoNext();
      this.currentKanaIndex = this.advanceSequence("kana");
      this.currentKanaScript = Math.random() < 0.5 ? "hira" : "kata";
      this.romajiInput = "";
      this.romajiFeedback = null;
    },
    checkRomaji() {
      const normalized = this.romajiInput.trim().toLowerCase();
      if (!normalized) {
        this.romajiFeedback = { ok: false, message: "Type a romaji answer first." };
        return;
      }
      const correct = normalized === this.currentKana.romaji;
      this.romajiFeedback = {
        ok: correct,
        message: correct ? "Correct! Next in 1 second." : "Not quite."
      };
      if (correct) {
        this.clearAutoNext();
        this.autoNextTimer = setTimeout(() => {
          this.nextKana();
        }, 1000);
      }
    },
    clearAutoNext() {
      if (this.autoNextTimer) {
        clearTimeout(this.autoNextTimer);
        this.autoNextTimer = null;
      }
    }
  }
}).mount("#app");
