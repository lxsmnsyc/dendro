const dendro = require('./dist').default;

const counter = dendro(() => 0);

const messageCounter = dendro((get) => {
  const value = get(counter);

  return `Received: ${value}`;
});

const sleep = (value) => new Promise((res) => setTimeout(res, value, true));

const delayedCounter = dendro(async (get) => {
  const value = get(counter);
  await sleep(2000);
  return `Received: ${value} after 2 seconds.`;
});


const tuple = dendro(async (get) => {
  const message = get(messageCounter);
  const delayed = await get(delayedCounter);

  return [message, delayed];
});

tuple.addListener((value) => {
  value.then(console.log);
});

counter.write(1);

setTimeout(() => {
  counter.write(1000);
}, 2500);
