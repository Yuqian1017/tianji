// Chapter registry — bonus/next chapters register here (Player is chapter-agnostic).
import { CHAPTER_1 } from './chapter1.js';
import { CHAPTER_2 } from './chapter2.js';
import { CHAPTER_3 } from './chapter3.js';
import { CHAPTER_4 } from './chapter4.js';
import { CHAPTER_QIANNANG } from './qiannang.js';

export const CHAPTERS = {
  [CHAPTER_1.id]: CHAPTER_1,
  [CHAPTER_2.id]: CHAPTER_2,
  [CHAPTER_3.id]: CHAPTER_3,
  [CHAPTER_4.id]: CHAPTER_4,
  [CHAPTER_QIANNANG.id]: CHAPTER_QIANNANG,
};
export { CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4, CHAPTER_QIANNANG };
