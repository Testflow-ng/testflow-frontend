import { describe, expect, it } from 'vitest';
import { picturesNeeded } from './csv.js';

describe('picturesNeeded', () => {
  it('returns null for a sheet with no picture columns', () => {
    expect(picturesNeeded('stem,optionA,optionB,correct\n"Q",1,2,A\n')).toBeNull();
  });
  it('lists each picture file name once, for the question and its options', () => {
    const csv = 'stem,options,correctIndex,stemImage,optionImages\n"Q1","A|B",0,q1.png,"a.png|b.png"\n"Q2","|",1,q1.png,"|c.png"\n';
    expect(picturesNeeded(csv).sort()).toEqual(['a.png', 'b.png', 'c.png', 'q1.png']);
  });
});
