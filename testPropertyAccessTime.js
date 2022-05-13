let letters = "abcdefghijklmnopqrstuvwxyz";
let obj = {};
let savedProps = [];

for (let i = 0; i < 1_000_000; i++) {
  let prop = "";
  for (let j = 0; j < 20; j++) {
    prop += letters[Math.floor(Math.random() * letters.length) - 1];
  }
  if (i % 100 == 0) savedProps.push(prop);

  obj[prop] = 0;
}
savedProps.sort();

console.time("timer1");
for (let i = 0; i < savedProps.length; i++) {
  obj[savedProps[i]];
}
console.timeEnd("timer1");
