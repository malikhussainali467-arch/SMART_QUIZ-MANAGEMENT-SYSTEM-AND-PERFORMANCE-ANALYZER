import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export class Subject extends BaseModel {}

Subject.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'Subject name is required' } },
      set(val) {
        this.setDataValue('name', String(val || '').trim());
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      set(val) {
        this.setDataValue('description', String(val || '').trim());
      },
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6d4aff',
    },
  },
  {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: true,
  }
);
