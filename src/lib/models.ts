import { DataTypes, Model, Optional } from 'sequelize';
import { getDb, connectToDatabase } from './db';
import bcrypt from 'bcrypt';

export { connectToDatabase };

const sequelize = getDb();

// --- User Model ---
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare phone: string | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Method to check password
    public async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
        },
    }
);

// --- Address Model ---
interface AddressAttributes {
    id: number;
    userId: number;
    title: string;
    address: string;
    isDefault: boolean;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'isDefault'> { }

export class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
    public id!: number;
    public userId!: number;
    public title!: string;
    public address!: string;
    public isDefault!: boolean;
}

Address.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING, // e.g., "Ev", "İş", "Depo"
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'addresses',
    }
);

// --- Order Model ---
interface OrderAttributes {
    id: number;
    userId: number | null;
    details: string; // JSON string or text description of items
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status'> { }

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    declare id: number;
    declare userId: number | null;
    declare details: string;
    declare status: 'PENDING' | 'COMPLETED' | 'CANCELLED';

    declare readonly createdAt: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Allow null for guest orders
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
            defaultValue: 'PENDING',
        },
    },
    {
        sequelize,
        tableName: 'orders',
    }
);

// Relationships
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId' });
