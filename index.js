const dendro = require('./dist');

const counter = dendro.node(0);

const messageCounter = dendro.edge({
  get({ get }) {
    const value = get(counter);

    return `Received: ${value}`;
  },
});

const sleep = (value) => new Promise((res) => setTimeout(res, value, true));

const delayedCounter = dendro.edge({
  async get({ get }) {
    const value = get(counter);
    await sleep(2000);
    return `Received: ${value} after 2 seconds.`;
  },
});


const tuple = dendro.edge({
  async get({ get }) {
    const message = get(messageCounter);
    const delayed = await get(delayedCounter);

    return [message, delayed];
  }
})

tuple.addListener((value) => {
  value.then(console.log);
});

counter.emit(1);

setTimeout(() => {
  counter.emit(1000);
}, 2500);
