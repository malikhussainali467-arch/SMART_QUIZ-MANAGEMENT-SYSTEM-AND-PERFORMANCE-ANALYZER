import { Model, Op } from 'sequelize';

export function translateFilter(filter) {
  if (!filter || Object.keys(filter).length === 0) return {};
  const where = {};
  for (const [key, val] of Object.entries(filter)) {
    let targetKey = key;
    if (key === '_id') targetKey = 'id';
    else if (key === 'subject') targetKey = 'subjectId';
    else if (key === 'topic') targetKey = 'topicId';
    else if (key === 'user') targetKey = 'userId';
    else if (key === 'quiz') targetKey = 'quizId';
    else if (key === 'createdBy') targetKey = 'createdById';

    if (val === null || val === undefined) {
      where[targetKey] = null;
    } else if (typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if (val.$in !== undefined) {
        where[targetKey] = {
          [Op.in]: val.$in.map((v) => (v && typeof v === 'object' && (v._id || v.id) ? String(v._id || v.id) : String(v))),
        };
      } else if (val.$regex !== undefined) {
        const clean = String(val.$regex).replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
        where[targetKey] = { [Op.like]: `%${clean}%` };
      } else {
        where[targetKey] = val;
      }
    } else {
      where[targetKey] = val && typeof val === 'object' && (val._id || val.id) ? String(val._id || val.id) : val;
    }
  }
  return where;
}

export function translateSort(sortCriteria) {
  if (!sortCriteria) return undefined;
  if (Array.isArray(sortCriteria)) return sortCriteria;
  const order = [];
  for (const [field, dir] of Object.entries(sortCriteria)) {
    const col = field === '_id' ? 'id' : field;
    order.push([col, dir === -1 || dir === 'desc' || dir === 'DESC' ? 'DESC' : 'ASC']);
  }
  return order;
}

export class Query {
  constructor(model, filter = {}, isSingle = false) {
    this.model = model;
    this.filter = filter;
    this.isSingle = isSingle;
    this.sortCriteria = null;
    this.populateList = [];
    this.selectFields = null;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  populate(path, fields) {
    this.populateList.push({ path, fields });
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  async execute() {
    const where = translateFilter(this.filter);
    const order = translateSort(this.sortCriteria);
    const options = { where };
    if (order) options.order = order;

    if (this.selectFields) {
      const parts = this.selectFields.trim().split(/\s+/);
      const cols = [
        'id',
        ...parts.map((p) => {
          if (p === 'subject') return 'subjectId';
          if (p === 'topic') return 'topicId';
          if (p === 'user') return 'userId';
          if (p === 'quiz') return 'quizId';
          if (p === 'createdBy') return 'createdById';
          return p;
        }),
      ];
      options.attributes = [...new Set(cols)];
    }

    const includes = [];
    let populateQuestions = null;

    for (const pop of this.populateList) {
      if (pop.path === 'questions' && this.model.name === 'Quiz') {
        populateQuestions = pop;
        continue;
      }

      let as = pop.path;
      if (pop.path === 'createdBy') as = 'creator';

      const inc = { association: as };
      if (pop.fields) {
        const reqFields = pop.fields.trim().split(/\s+/);
        inc.attributes = ['id', ...reqFields];
      }
      includes.push(inc);
    }

    if (includes.length) options.include = includes;

    let result;
    if (this.isSingle) {
      result = await Model.findOne.call(this.model, options);
    } else {
      result = await Model.findAll.call(this.model, options);
    }

    if (populateQuestions && result) {
      const items = Array.isArray(result) ? result : [result];
      const allQIds = [...new Set(items.flatMap((q) => q.questions || []))];
      if (allQIds.length) {
        const QuestionModel = this.model.sequelize.models.Question;
        const qOptions = { where: { id: { [Op.in]: allQIds } } };
        if (populateQuestions.fields) {
          const fields = populateQuestions.fields.trim().split(/\s+/);
          const cols = ['id', ...fields.map((f) => (f === 'topic' ? 'topicId' : f))];
          qOptions.attributes = [...new Set(cols)];
        }
        const foundQuestions = await Model.findAll.call(QuestionModel, qOptions);
        const byId = new Map(foundQuestions.map((q) => [String(q.id), q]));
        for (const quiz of items) {
          quiz.questions = (quiz.questions || []).map((id) => byId.get(String(id))).filter(Boolean);
        }
      }
    }

    return result;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

export class BaseModel extends Model {
  constructor(values, options) {
    super(BaseModel.sanitize(values), options);
  }

  static sanitize(values) {
    if (!values || typeof values !== 'object') return values;
    const val = { ...values };
    if (val._id && !val.id) val.id = val._id;
    if (val.subject !== undefined && val.subjectId === undefined) {
      val.subjectId = val.subject && typeof val.subject === 'object' ? val.subject.id || val.subject._id : val.subject;
      delete val.subject;
    }
    if (val.topic !== undefined && val.topicId === undefined) {
      val.topicId = val.topic && typeof val.topic === 'object' ? val.topic.id || val.topic._id : val.topic;
      delete val.topic;
    }
    if (val.user !== undefined && val.userId === undefined) {
      val.userId = val.user && typeof val.user === 'object' ? val.user.id || val.user._id : val.user;
      delete val.user;
    }
    if (val.quiz !== undefined && val.quizId === undefined) {
      val.quizId = val.quiz && typeof val.quiz === 'object' ? val.quiz.id || val.quiz._id : val.quiz;
      delete val.quiz;
    }
    if (val.createdBy !== undefined && val.createdById === undefined) {
      val.createdById = val.createdBy && typeof val.createdBy === 'object' ? val.createdBy.id || val.createdBy._id : val.createdBy;
      delete val.createdBy;
    }
    return val;
  }

  static build(values, options) {
    return super.build(this.sanitize(values), options);
  }

  static create(values, options) {
    return super.create(this.sanitize(values), options);
  }

  toObject() {
    return this.toJSON();
  }

  toJSON() {
    const values = super.toJSON();
    values.id = this.id;
    values._id = this.id;

    // Provide default mappings for foreign keys to match mongo-like document format
    if (values.subjectId !== undefined && values.subject === undefined) values.subject = values.subjectId;
    if (values.topicId !== undefined && values.topic === undefined) values.topic = values.topicId;
    if (values.userId !== undefined && values.user === undefined) values.user = values.userId;
    if (values.quizId !== undefined && values.quiz === undefined) values.quiz = values.quizId;
    if (values.createdById !== undefined && values.createdBy === undefined) values.createdBy = values.createdById;

    return values;
  }

  async deleteOne() {
    return this.destroy();
  }

  static findById(id) {
    if (!id) return new Query(this, { id: '00000000-0000-0000-0000-000000000000' }, true);
    return new Query(this, { id }, true);
  }

  static findOne(filter = {}) {
    if (filter && (filter.where !== undefined || filter.include !== undefined || filter.attributes !== undefined)) {
      return super.findOne(filter);
    }
    return new Query(this, filter, true);
  }

  static find(filter = {}) {
    if (filter && (filter.where !== undefined || filter.include !== undefined || filter.attributes !== undefined)) {
      return super.findAll(filter);
    }
    return new Query(this, filter, false);
  }

  static async countDocuments(filter = {}) {
    const where = translateFilter(filter);
    return Model.count.call(this, { where });
  }

  static async deleteMany(filter = {}) {
    const where = translateFilter(filter);
    return Model.destroy.call(this, { where });
  }

  static async updateMany(filter = {}, update = {}) {
    if (update.$pull && update.$pull.questions) {
      const qId = String(update.$pull.questions);
      const all = await Model.findAll.call(this);
      for (const item of all) {
        if (Array.isArray(item.questions) && item.questions.some((id) => String(id) === qId)) {
          item.questions = item.questions.filter((id) => String(id) !== qId);
          await item.save();
        }
      }
      return;
    }
    const where = translateFilter(filter);
    return Model.update.call(this, update, { where });
  }
}

Object.defineProperty(BaseModel.prototype, '_id', {
  get() {
    return this.getDataValue('id');
  },
  set(val) {
    this.setDataValue('id', val);
  },
  configurable: true,
  enumerable: true,
});
