export const assemblyQueryArgs = {
  include: {
    userCreated: true,
    userDeleted: true
  }
};

export const materialQueryArgs = {
  include: {
    assembly: {
      ...assemblyQueryArgs
    },
    wbsElement: true,
    userCreated: true,
    userDeleted: true,
    materialType: true,
    quantityUnit: true,
    manufacturer: true
  }
};
