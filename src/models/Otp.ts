import { DataTypes } from 'sequelize';
import sequelize from '../lib/db';
import User from './User';

const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'email',
        },
    },
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

export default Otp;
