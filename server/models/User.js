import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export const ROLES = ['student', 'teacher'];

export class User extends BaseModel {
  static hashPassword(plain) {
    return bcrypt.hash(plain, 10);
  }

  verifyPassword(plain) {
    return bcrypt.compare(plain, this.passwordHash);
  }

  toJSON() {
    const values = super.toJSON();
    delete values.passwordHash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'Email is required' } },
      set(val) {
        this.setDataValue('email', String(val || '').toLowerCase().trim());
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...ROLES),
      defaultValue: 'student',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);
