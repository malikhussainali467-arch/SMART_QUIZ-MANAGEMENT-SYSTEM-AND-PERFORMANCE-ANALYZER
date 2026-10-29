import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export class Attempt extends BaseModel {}

Attempt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passPercent: {
      type: DataTypes.FLOAT,
      defaultValue: 50,
    },
    items: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    answers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'submitted'),
      defaultValue: 'in_progress',
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalMarks: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    percentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Attempt',
    tableName: 'attempts',
    timestamps: true,
    hooks: {
      beforeSave(inst) {
        if (inst.items) inst.changed('items', true);
        if (inst.answers) inst.changed('answers', true);
      },
    },
  }
);

Object.defineProperty(Attempt.prototype, 'user', {
  get() {
    return this.dataValues.user !== undefined ? this.dataValues.user : this.userId;
  },
  set(val) {
    this.dataValues.user = val;
    if (val && typeof val === 'object') {
      this.setDataValue('userId', val.id || val._id);
    } else if (val) {
      this.setDataValue('userId', val);
    }
  },
});

Object.defineProperty(Attempt.prototype, 'quiz', {
  get() {
    return this.dataValues.quiz !== undefined ? this.dataValues.quiz : this.quizId;
  },
  set(val) {
    this.dataValues.quiz = val;
    if (val && typeof val === 'object') {
      this.setDataValue('quizId', val.id || val._id);
    } else if (val) {
      this.setDataValue('quizId', val);
    }
  },
});
