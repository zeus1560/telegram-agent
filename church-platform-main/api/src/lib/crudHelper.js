module.exports.crudHelper = {
  list: async (
    model,
    limit,
    offset,
    attributes,
    where = {},
    include = [],
    order = []
  ) => {
    const result = await model.findAndCountAll({
      attributes,
      limit: limit || 10,
      offset: offset || 0,
      where,
      include,
      order
    });
    return result;
  },
  detail: async (model, id, attributes, include = []) => {
    const result = await model.findOne({
      where: { id },
      attributes,
      include
    });
    return result;
  },
  add: async (model, data) => {
    const result = await model.create(data);
    return result;
  },
  delete: async (model, id) => {
    const result = await model.destroy({
      where: { id }
    });
    return result;
  },
  update: async (model, id, data) => {
    const result = await model.update(data, {
      where: { id }
    });
    return result;
  }
};
