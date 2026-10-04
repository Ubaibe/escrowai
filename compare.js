const fs = require('fs');
const cfg = fs.readFileSync('./blockchain/src/config.ts','utf8');
const m1 = cfg.match(/DEFAULT_USDC_ADDRESS\s*=\s*"([^"]+)"/);
const tst = fs.readFileSync('./blockchain/test/deployment.test.ts','utf8');
const m2 = tst.match(/DEFAULT_USDC_ADDRESS\)\.to\.equal\("([^"]+)"\)/);
console.log('config:', JSON.stringify(m1[1]), 'len:', m1[1].length);
console.log('test  :', JSON.stringify(m2[1]), 'len:', m2[1].length);
console.log('equal :', m1[1] === m2[1]);
