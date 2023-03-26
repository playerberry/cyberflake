const Cyberflake = require('../src/index');

describe('Cyberflake', () => {
  const cyberflake = new Cyberflake();

  it('generates unique IDs', () => {
    const id1 = cyberflake.generate();
    const id2 = cyberflake.generate();

    expect(id1).not.toBe(id2);
  });

  it('decodes generated IDs', () => {
    const id = cyberflake.generate();
    const decoded = cyberflake.decode(id);

    expect(decoded).toHaveProperty('timestamp');
    expect(decoded).toHaveProperty('datacenterId');
    expect(decoded).toHaveProperty('workerId');
    expect(decoded).toHaveProperty('sequenceId');
  });
});
