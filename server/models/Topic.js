import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export class Topic extends BaseModel {}

Topic.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Topic name is required' } },
      set(val) {
        this.setDataValue('name', String(val || '').trim());
      },
    },
  },
  {
    sequelize,
    modelName: 'Topic',
    tableName: 'topics',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['subjectId', 'name'],
      },
    ],
  }
);

Object.defineProperty(Topic.prototype, 'subject', {
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
