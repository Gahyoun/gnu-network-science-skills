import test from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../src/physics.mjs';
const near=(actual,expected,relative=1e-6)=>assert.ok(Math.abs(actual-expected)<=relative*Math.abs(expected),`${actual} ≠ ${expected}`);

test('MB/BE/FD dilute limit and Pauli bound',()=>{
  for(const kind of ['BE','FD'])near(P.occupancy(20,kind),Math.exp(-20));
  assert.equal(P.occupancy(0,'FD'),.5);
  assert.ok(Number.isNaN(P.occupancy(-1,'BE')));
  for(const x of [-1000,-10,0,10,1000])assert.ok(P.occupancy(x,'FD')>=0&&P.occupancy(x,'FD')<=1);
  assert.deepEqual([-1,0,1].map(x=>P.fermi(x,0,0)),[1,.5,0]);
});
test('distinguishable and indistinguishable microstate counts',()=>{
  for(const N of [2,3]){
    const mb=P.stateConfigurations('MB',N,4);
    assert.equal(mb.reduce((sum,c)=>sum+P.classicalMultiplicity(c),0),4**N);
    assert.equal(P.stateConfigurations('BE',N,4).length,N===2?10:20);
    assert.equal(P.stateConfigurations('FD',N,4).length,N===2?6:4);
    assert.ok(P.stateConfigurations('FD',N,4).every(c=>c.every(n=>n<=1)));
  }
});
test('Planck spectrum reproduces Wien and Stefan–Boltzmann laws',()=>{
  near(P.SIGMA,5.670374419e-8,1e-9);near(P.WIEN,2.897771955e-3,1e-9);
  for(const T of [500,3000,5800,10000]){
    const peak=P.WIEN/T*1e9;
    assert.ok(P.spectralRadiancy(peak,T)>P.spectralRadiancy(peak*.99,T));
    assert.ok(P.spectralRadiancy(peak,T)>P.spectralRadiancy(peak*1.01,T));
    near(P.bandRadiancy(0,Infinity,T),P.SIGMA*T**4,1e-7);
    const direct=P.simpson(x=>P.spectralRadiancy(x,T),400,700,1200);
    near(P.bandRadiancy(400,700,T),direct,2e-6);
    near(P.bandRadiancy(700,400,T),direct,2e-6);
    assert.equal(P.spectralRadiancy(0,T),0);
  }
});
test('quantized heat capacity has classical and low-temperature limits',()=>{
  near(P.einsteinCV(100),1,1e-5);near(P.debyeCV(100),1,1e-5);
  near(P.debyeCV(.01),4*Math.PI**4/5*.01**3,1e-7);
  near(P.debyeCV(.02)/P.debyeCV(.01),8,1e-7);
  assert.ok(P.einsteinCV(.01)<1e-35);
});
test('wave endpoints and positive lattice modes',()=>{
  for(const j of [1,10,30]){near(P.modeWave(.5/j,j),1);assert.ok(Math.abs(P.modeWave(1,j))<1e-13);assert.equal(P.modeWave(0,j),0);}
  assert.equal(P.modeCount(3,11,11.55,7).length,343);
  assert.deepEqual(P.modeCount(1,18,19,30).filter(p=>p.selected).map(p=>p.v[0]),[18,19]);
});
test('free electrons preserve N and agree with Sommerfeld expansion',()=>{
  for(const ef of [1,6,12]){
    assert.deepEqual(P.electronMoments(ef,0),{number:1,energy:.6*ef});
    for(const T of [10,500,2000]){
      const mu=P.chemicalPotential(ef,T),m=P.electronMoments(ef,T,mu);
      near(m.number,1,1e-8);assert.ok(mu<ef);assert.ok(m.energy>.6*ef);
    }
  }
  const ef=6,T=500,kt=P.C.kEV*T,mu=P.chemicalPotential(ef,T);
  near(mu,ef-Math.PI**2/12*kt**2/ef,1e-7);
  const delta=P.electronMoments(ef,T,mu).energy-.6*ef;
  near(delta,Math.PI**2/4*kt**2/ef,1e-3);
});
test('neutron-star educational model balances pressure and scales with mass',()=>{
  const a=P.neutronStar(1.5),b=P.neutronStar(2);
  near(a.pressure,a.gravitationalPressure,1e-12);
  near(b.R/a.R,(2/1.5)**(-1/3),1e-12);
  near(a.R/1000,10.75,.01);near(a.rho,5.75e17,.02);near(a.pressure,2e33,.06); // Original pressure is rounded to one significant digit.
});
