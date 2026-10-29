import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export class Quiz extends BaseModel {}

Quiz.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Quiz title is required' } },
      set(val) {
        this.setDataValue('title', String(val || '').trim());
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      set(val) {
        this.setDataValue('description', String(val || '').trim());
      },
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    questions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    passPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Quiz',
    tableName: 'quizzes',
    timestamps: true,
    hooks: {
      beforeSave(inst) {
        if (inst.questions) inst.changed('questions', true);
      },
    },
  }
);

Object.defineProperty(Quiz.prototype, 'subject', {
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

Object.defineProperty(Quiz.prototype, 'createdBy', {
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
