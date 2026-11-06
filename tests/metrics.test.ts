import {describe,it,expect} from 'vitest';
function stats(rr:number[]){const wins=rr.filter(x=>x>0).length,losses=rr.filter(x=>x<0).length;return {winRate:wins+losses?wins/(wins+losses)*100:0,netR:rr.reduce((a,b)=>a+b,0)}}
describe('journal performance definitions',()=>{
 it('excludes breakeven trades from win-rate denominator',()=>{expect(stats([2,-1,0,1]).winRate).toBeCloseTo(66.6667,3)});
 it('sums net R including losses and breakeven',()=>{expect(stats([2,-1,0,1]).netR).toBe(2)});
 it('returns zero win rate when there are no closed outcomes',()=>{expect(stats([0,0]).winRate).toBe(0)});
});
