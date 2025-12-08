import { DataTypes, Model, Optional } from 'sequelize';
import { getDb, connectToDatabase } from './db';
import bcrypt from 'bcrypt';

export { connectToDatabase };

const sequelize = getDb();

// HMR Fix: In development, clear models to prevent "Model already defined" error on reload
if (process.env.NODE_ENV !== 'production' && sequelize) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sequelize as any).modelManager.models = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sequelize as any).models = {};
    } catch (e) {
        console.error("HMR maintenance error:", e);
    }
}

// --- User Model ---
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    role?: 'user' | 'admin' | 'editor';
    sessionToken?: string; // For single session management
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare phone: string | undefined;
    declare role: 'user' | 'admin' | 'editor';
    declare sessionToken: string | undefined;

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
        role: {
            type: DataTypes.ENUM('user', 'admin', 'editor'),
            defaultValue: 'user',
        },
        sessionToken: {
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
    status: 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
    trackingNumber?: string; // Kargo takip numarası
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'trackingNumber'> { }

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    declare id: number;
    declare userId: number | null;
    declare details: string;
    declare status: 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
    declare trackingNumber: string | undefined;

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
            // Updated ENUM to include SHIPPING and COMPLETED
            type: DataTypes.ENUM('PENDING', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'),
            defaultValue: 'PENDING',
        },
        trackingNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'orders',
    }
);

// Force Sync in Dev to update ENUM (Temporary Fix Logic)
if (process.env.NODE_ENV !== 'production') {
    sequelize.sync({ alter: true }).catch(err => console.error('Sync Error:', err));
}

// --- AdminUser Model (Dashboard Yöneticileri) ---
interface AdminUserAttributes {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'editor';
    isActive: boolean;
    lastLoginAt?: Date;
}

interface AdminUserCreationAttributes extends Optional<AdminUserAttributes, 'id' | 'isActive' | 'lastLoginAt'> { }

export class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare role: 'super_admin' | 'admin' | 'editor';
    declare isActive: boolean;
    declare lastLoginAt: Date | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

AdminUser.init(
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
            validate: { isEmail: true },
        },
        role: {
            type: DataTypes.ENUM('super_admin', 'admin', 'editor'),
            defaultValue: 'editor',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'admin_users',
    }
);

// --- OTPToken Model (Dashboard Giriş Kodları) ---
interface OTPTokenAttributes {
    id: number;
    email: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
}

interface OTPTokenCreationAttributes extends Optional<OTPTokenAttributes, 'id' | 'isUsed'> { }

export class OTPToken extends Model<OTPTokenAttributes, OTPTokenCreationAttributes> implements OTPTokenAttributes {
    declare id: number;
    declare email: string;
    declare token: string;
    declare expiresAt: Date;
    declare isUsed: boolean;

    declare readonly createdAt: Date;
}

OTPToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'otp_tokens',
    }
);

// --- MediaFile Model (Medya Yönetimi) ---
interface MediaFileAttributes {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy?: number;
}

interface MediaFileCreationAttributes extends Optional<MediaFileAttributes, 'id' | 'uploadedBy'> { }

export class MediaFile extends Model<MediaFileAttributes, MediaFileCreationAttributes> implements MediaFileAttributes {
    declare id: number;
    declare filename: string;
    declare originalName: string;
    declare mimeType: string;
    declare size: number;
    declare url: string;
    declare uploadedBy: number | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

MediaFile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        uploadedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'media_files',
    }
);

// --- ContentPage Model (İçerik Yönetimi) ---
interface ContentPageAttributes {
    id: number;
    slug: string;
    title: string;
    content: string;
    metaDescription?: string;
    isPublished: boolean;
    publishedAt?: Date;
    updatedBy?: number;
}

interface ContentPageCreationAttributes extends Optional<ContentPageAttributes, 'id' | 'isPublished' | 'metaDescription' | 'publishedAt' | 'updatedBy'> { }

export class ContentPage extends Model<ContentPageAttributes, ContentPageCreationAttributes> implements ContentPageAttributes {
    declare id: number;
    declare slug: string;
    declare title: string;
    declare content: string;
    declare metaDescription: string | undefined;
    declare isPublished: boolean;
    declare publishedAt: Date | undefined;
    declare updatedBy: number | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ContentPage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        metaDescription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'content_pages',
    }
);

// --- MailingCampaign Model (E-posta Kampanyaları) ---
interface MailingCampaignAttributes {
    id: number;
    name: string;
    subject: string;
    content: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    scheduledAt?: Date;
    sentAt?: Date;
    recipientCount: number;
    openCount: number;
    clickCount: number;
}

interface MailingCampaignCreationAttributes extends Optional<MailingCampaignAttributes, 'id' | 'status' | 'scheduledAt' | 'sentAt' | 'recipientCount' | 'openCount' | 'clickCount'> { }

export class MailingCampaign extends Model<MailingCampaignAttributes, MailingCampaignCreationAttributes> implements MailingCampaignAttributes {
    declare id: number;
    declare name: string;
    declare subject: string;
    declare content: string;
    declare status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    declare scheduledAt: Date | undefined;
    declare sentAt: Date | undefined;
    declare recipientCount: number;
    declare openCount: number;
    declare clickCount: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

MailingCampaign.init(
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
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled'),
            defaultValue: 'draft',
        },
        scheduledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        recipientCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        openCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        clickCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'mailing_campaigns',
    }
);

// --- ContactRequest Model (İletişim Talepleri) ---
interface ContactRequestAttributes {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    repliedAt?: Date;
}

interface ContactRequestCreationAttributes extends Optional<ContactRequestAttributes, 'id' | 'status' | 'phone' | 'company' | 'repliedAt'> { }

export class ContactRequest extends Model<ContactRequestAttributes, ContactRequestCreationAttributes> implements ContactRequestAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare phone: string | undefined;
    declare company: string | undefined;
    declare message: string;
    declare status: 'new' | 'read' | 'replied' | 'archived';
    declare repliedAt: Date | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

ContactRequest.init(
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
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('new', 'read', 'replied', 'archived'),
            defaultValue: 'new',
        },
        repliedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'contact_requests',
    }
);

// --- SiteAnalytics Model (Ziyaret İstatistikleri) ---
interface SiteAnalyticsAttributes {
    id: number;
    date: Date;
    pageUrl: string;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate?: number;
    avgSessionDuration?: number;
}

interface SiteAnalyticsCreationAttributes extends Optional<SiteAnalyticsAttributes, 'id' | 'bounceRate' | 'avgSessionDuration'> { }

export class SiteAnalytics extends Model<SiteAnalyticsAttributes, SiteAnalyticsCreationAttributes> implements SiteAnalyticsAttributes {
    declare id: number;
    declare date: Date;
    declare pageUrl: string;
    declare pageViews: number;
    declare uniqueVisitors: number;
    declare bounceRate: number | undefined;
    declare avgSessionDuration: number | undefined;

    declare readonly createdAt: Date;
}

SiteAnalytics.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        pageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pageViews: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        uniqueVisitors: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        bounceRate: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        avgSessionDuration: {
            type: DataTypes.INTEGER, // seconds
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'site_analytics',
        indexes: [
            { fields: ['date', 'pageUrl'], unique: true },
        ],
    }
);

// --- NotificationRead Model (Bildirim Okunma/Silme Durumu) ---
interface NotificationReadAttributes {
    id: number;
    userId: number;
    notificationId: string; // "order-123", "contact-456"
    readAt: Date;
    deletedAt: Date | null; // null = not deleted, Date = deleted by this user
}

interface NotificationReadCreationAttributes extends Optional<NotificationReadAttributes, 'id' | 'readAt' | 'deletedAt'> { }

export class NotificationRead extends Model<NotificationReadAttributes, NotificationReadCreationAttributes> implements NotificationReadAttributes {
    declare id: number;
    declare userId: number;
    declare notificationId: string;
    declare readAt: Date;
    declare deletedAt: Date | null;

    declare readonly createdAt: Date;
}

NotificationRead.init(
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
        notificationId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        readAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        tableName: 'notification_reads',
        indexes: [
            { fields: ['userId', 'notificationId'], unique: true },
        ],
    }
);

// Relationships - Wrapped in Try/Catch to prevent crashes if models are not fully ready (Fixes HMR circular issues)
try {
    if (User && Address) {
        User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
        Address.belongsTo(User, { foreignKey: 'userId' });
    }

    if (User && Order) {
        User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
        Order.belongsTo(User, { foreignKey: 'userId' });
    }

    if (AdminUser && MediaFile) {
        AdminUser.hasMany(MediaFile, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
        MediaFile.belongsTo(AdminUser, { foreignKey: 'uploadedBy' });
    }

    if (AdminUser && ContentPage) {
        AdminUser.hasMany(ContentPage, { foreignKey: 'updatedBy', as: 'editedPages' });
        ContentPage.belongsTo(AdminUser, { foreignKey: 'updatedBy' });
    }

    console.log('✅ Model associations initialized.');
} catch (error) {
    console.error('❌ Error initializing model associations:', error);
}
