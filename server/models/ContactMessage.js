import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { BaseModel } from './BaseModel.js';

export class ContactMessage extends BaseModel {}

ContactMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } },
      set(val) {
        this.setDataValue('name', String(val || '').trim());
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Email is required' }, isEmail: { msg: 'Valid email is required' } },
      set(val) {
        this.setDataValue('email', String(val || '').toLowerCase().trim());
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Subject is required' } },
      set(val) {
        this.setDataValue('subject', String(val || '').trim());
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: 'Message is required' } },
      set(val) {
        this.setDataValue('message', String(val || '').trim());
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'new',
      validate: { isIn: [['new', 'resolved']] },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'ContactMessage',
    tableName: 'contact_messages',
    timestamps: true,
  }
);

Object.defineProperty(ContactMessage.prototype, 'user', {
  get() {
    return this.dataValues.user !== undefined ? this.dataValues.user : this.userId;
  },
  set(val) {
    this.dataValues.user = val;
    if (val && typeof val === 'object') {
      this.setDataValue('userId', val.id || val._id);
    } else {
      this.setDataValue('userId', val);
    }
  },
});

Object.defineProperty(ContactMessage.prototype, 'user_id', {
  get() {
    return this.userId;
  },
  set(val) {
    this.userId = val;
  },
});

Object.defineProperty(ContactMessage.prototype, 'created_at', {
  get() {
    return this.createdAt;
  },
  set(val) {
    this.createdAt = val;
  },
});
