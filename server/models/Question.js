import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export const QUESTION_TYPES = ['mcq', 'theory'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export class Question extends BaseModel {}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    topicId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...QUESTION_TYPES),
      defaultValue: 'mcq',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Question text is required' } },
      set(val) {
        this.setDataValue('text', String(val || '').trim());
      },
    },
    difficulty: {
      type: DataTypes.ENUM(...DIFFICULTIES),
      defaultValue: 'medium',
    },
    marks: {
      type: DataTypes.FLOAT,
      defaultValue: 1,
      validate: { min: 0.5 },
    },
    explanation: {
      type: DataTypes.TEXT,
      defaultValue: '',
      set(val) {
        this.setDataValue('explanation', String(val || '').trim());
      },
    },
    options: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    modelAnswer: {
      type: DataTypes.TEXT,
      defaultValue: '',
      set(val) {
        this.setDataValue('modelAnswer', String(val || '').trim());
      },
    },
    keywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
    hooks: {
      beforeValidate(inst) {
        if (inst.type === 'mcq') {
          inst.options = (inst.options || []).map((o) => String(o).trim()).filter(Boolean);
          if (inst.options.length < 2) {
            throw new Error('An MCQ needs at least 2 options');
          }
          if (inst.correctIndex < 0 || inst.correctIndex >= inst.options.length) {
            throw new Error('Correct answer must be one of the options');
          }
        } else {
          inst.keywords = (inst.keywords || []).map((k) => String(k).trim().toLowerCase()).filter(Boolean);
        }
      },
      beforeSave(inst) {
        if (inst.options) inst.changed('options', true);
        if (inst.keywords) inst.changed('keywords', true);
      },
    },
  }
);

Object.defineProperty(Question.prototype, 'subject', {
  get() {
    return this.dataValues.subject !== undefined ? this.dataValues.subject : this.subjectId;
  },
  set(val) {
    this.dataValues.subject = val;
    if (val && typeof val === 'object') {
      this.setDataValue('subjectId', val.id || val._id);
    } else if (val) {
      this.setDataValue('subjectId', val);
    }
  },
});

Object.defineProperty(Question.prototype, 'topic', {
  get() {
    return this.dataValues.topic !== undefined ? this.dataValues.topic : this.topicId;
  },
  set(val) {
    this.dataValues.topic = val;
    if (val && typeof val === 'object') {
      this.setDataValue('topicId', val.id || val._id);
    } else if (val) {
      this.setDataValue('topicId', val);
    }
  },
});

Object.defineProperty(Question.prototype, 'createdBy', {
  get() {
    return this.dataValues.creator !== undefined ? this.dataValues.creator : this.createdById;
  },
  set(val) {
    this.dataValues.creator = val;
    if (val && typeof val === 'object') {
      this.setDataValue('createdById', val.id || val._id);
    } else if (val) {
      this.setDataValue('createdById', val);
    }
  },
});
