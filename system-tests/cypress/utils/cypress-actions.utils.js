const base = {
  EXIST: 'exist',
  VISIBLE: 'be.visible',
  NOT: 'not',
  LENGTH_GREATER_THAN: 'have.length.greaterThan',
  INCLUDE: 'include'
};

const built = {
  NOT_EXIST: base.NOT + '.' + base.EXIST,
  NOT_BE_VISIBLE: base.NOT + '.' + base.VISIBLE
};

const ACTIONS = { ...base, ...built };

export default ACTIONS;
