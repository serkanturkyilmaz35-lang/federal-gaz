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
    templateSlug: string; // Changed from templateId to templateSlug to reference EmailTemplate
    recipientType: 'all' | 'members' | 'guests' | 'custom' | 'external';
    recipientIds?: string; // JSON array of user IDs for custom selection
    externalRecipients?: string; // JSON array of {name, email} for external recipients
    customLogoUrl?: string; // Custom logo override
    customProductImageUrl?: string; // Custom product image override
    campaignTitle?: string; // Banner title override (e.g. "YAZ FIRSATI")
    campaignHighlight?: string; // Highlight text (e.g. "%50 İNDİRİM")
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    scheduledAt?: Date;
    sentAt?: Date;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    openCount: number;
    clickCount: number;
    errorLog?: string; // JSON array of failed emails with error messages
}

interface MailingCampaignCreationAttributes extends Optional<MailingCampaignAttributes, 'id' | 'status' | 'templateSlug' | 'recipientType' | 'scheduledAt' | 'sentAt' | 'recipientCount' | 'sentCount' | 'failedCount' | 'openCount' | 'clickCount' | 'recipientIds' | 'externalRecipients' | 'customLogoUrl' | 'customProductImageUrl' | 'campaignTitle' | 'campaignHighlight' | 'errorLog'> { }

export class MailingCampaign extends Model<MailingCampaignAttributes, MailingCampaignCreationAttributes> implements MailingCampaignAttributes {
    declare id: number;
    declare name: string;
    declare subject: string;
    declare content: string;
    declare templateSlug: string;
    declare recipientType: 'all' | 'members' | 'guests' | 'custom' | 'external';
    declare recipientIds: string | undefined;
    declare externalRecipients: string | undefined;
    declare customLogoUrl: string | undefined;
    declare customProductImageUrl: string | undefined;
    declare campaignTitle: string | undefined;
    declare campaignHighlight: string | undefined;
    declare status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    declare scheduledAt: Date | undefined;
    declare sentAt: Date | undefined;
    declare recipientCount: number;
    declare sentCount: number;
    declare failedCount: number;
    declare openCount: number;
    declare clickCount: number;
    declare errorLog: string | undefined;

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
        templateSlug: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'modern',
        },
        recipientType: {
            type: DataTypes.ENUM('all', 'members', 'guests', 'custom', 'external'),
            defaultValue: 'all',
        },
        recipientIds: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        externalRecipients: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        customLogoUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        customProductImageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        campaignTitle: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        campaignHighlight: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'),
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
        sentCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        failedCount: {
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
        errorLog: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'mailing_campaigns',
    }
);

// --- MailingLog Model (E-posta Gönderim Kayıtları) ---
interface MailingLogAttributes {
    id: number;
    campaignId: number;
    userEmail: string;
    userId?: number;
    status: 'sent' | 'failed' | 'opened' | 'clicked';
    errorMessage?: string;
    sentAt: Date;
    openedAt?: Date;
    clickedAt?: Date;
}

interface MailingLogCreationAttributes extends Optional<MailingLogAttributes, 'id' | 'userId' | 'errorMessage' | 'openedAt' | 'clickedAt'> { }

export class MailingLog extends Model<MailingLogAttributes, MailingLogCreationAttributes> implements MailingLogAttributes {
    declare id: number;
    declare campaignId: number;
    declare userEmail: string;
    declare userId: number | undefined;
    declare status: 'sent' | 'failed' | 'opened' | 'clicked';
    declare errorMessage: string | undefined;
    declare sentAt: Date;
    declare openedAt: Date | undefined;
    declare clickedAt: Date | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

MailingLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        userEmail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('sent', 'failed', 'opened', 'clicked'),
            defaultValue: 'sent',
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        openedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        clickedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'mailing_logs',
        // Indexes removed to prevent "Too many keys specified" error during sync
        // indexes: [
        //     { fields: ['campaignId'] },
        //     { fields: ['userEmail'] },
        // ]
    }
);

// --- EmailTemplate Model (E-posta Şablonları) ---
interface EmailTemplateAttributes {
    id: number;
    slug: string; // unique identifier: 'modern', 'classic', 'new-year', etc.
    nameTR: string;
    nameEN: string;
    category: 'general' | 'holiday' | 'promotion';
    headerBgColor: string;
    headerTextColor: string;
    headerImage?: string;
    bodyBgColor: string;
    bodyTextColor: string;
    buttonColor: string;
    footerBgColor: string;
    footerTextColor: string;
    footerImage?: string;
    bannerImage?: string;
    logoUrl?: string;
    headerTitle?: string;      // Plain text email title
    bodyContent?: string;      // Plain text body content
    footerContact?: string;    // Plain text footer contact info
    buttonText?: string;       // Custom button text
    templateData?: any;        // JSON for extra template fields
    headerHtml: string; // Custom header HTML
    footerHtml: string; // Custom footer HTML
    isActive: boolean;
    sortOrder: number;
}

interface EmailTemplateCreationAttributes extends Optional<EmailTemplateAttributes, 'id' | 'isActive' | 'sortOrder' | 'bannerImage' | 'headerImage' | 'footerImage' | 'headerTitle' | 'bodyContent' | 'footerContact' | 'buttonText' | 'templateData'> { }

export class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
    declare id: number;
    declare slug: string;
    declare nameTR: string;
    declare nameEN: string;
    declare category: 'general' | 'holiday' | 'promotion';
    declare headerBgColor: string;
    declare headerTextColor: string;
    declare headerImage: string | undefined;
    declare bodyBgColor: string;
    declare bodyTextColor: string;
    declare buttonColor: string;
    declare footerBgColor: string;
    declare footerTextColor: string;
    declare footerImage: string | undefined;
    declare bannerImage: string | undefined;
    declare logoUrl: string | undefined;
    declare headerTitle: string | undefined;
    declare bodyContent: string | undefined;
    declare footerContact: string | undefined;
    declare buttonText: string | undefined;
    declare templateData: any | undefined;
    declare headerHtml: string;
    declare footerHtml: string;
    declare isActive: boolean;
    declare sortOrder: number;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

EmailTemplate.init(
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
        nameTR: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nameEN: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('general', 'holiday', 'promotion'),
            defaultValue: 'general',
        },
        headerBgColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#1a2744',
        },
        headerTextColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#ffffff',
        },
        headerImage: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        bodyBgColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#ffffff',
        },
        bodyTextColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#333333',
        },
        buttonColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#b13329',
        },
        buttonText: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        templateData: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        footerBgColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#1a2744',
        },
        footerTextColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '#888888',
        },
        footerImage: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        bannerImage: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        logoUrl: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        headerTitle: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bodyContent: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        footerContact: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        headerHtml: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        footerHtml: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'email_templates',
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

// --- SiteSettings Model (Site Ayarları) ---
interface SiteSettingsAttributes {
    id: number;
    key: string; // e.g., 'site_name', 'contact_phone', 'instagram_url'
    value: string;
    category: 'general' | 'contact' | 'social' | 'seo';
    description?: string;
}

interface SiteSettingsCreationAttributes extends Optional<SiteSettingsAttributes, 'id' | 'description'> { }

export class SiteSettings extends Model<SiteSettingsAttributes, SiteSettingsCreationAttributes> implements SiteSettingsAttributes {
    declare id: number;
    declare key: string;
    declare value: string;
    declare category: 'general' | 'contact' | 'social' | 'seo';
    declare description: string | undefined;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

SiteSettings.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('general', 'contact', 'social', 'seo'),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'site_settings',
    }
);

// --- Product Model (Ürün Kategorileri) ---
interface ProductAttributes {
    id: number;
    slug: string;
    slugEN: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    contentTR: string; // Detaylı açıklama
    contentEN: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'sortOrder' | 'isActive' | 'contentTR' | 'contentEN'> { }

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    declare id: number;
    declare slug: string;
    declare slugEN: string;
    declare titleTR: string;
    declare titleEN: string;
    declare descTR: string;
    declare descEN: string;
    declare contentTR: string;
    declare contentEN: string;
    declare image: string;
    declare sortOrder: number;
    declare isActive: boolean;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Product.init(
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
        slugEN: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        titleTR: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        titleEN: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descTR: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        descEN: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contentTR: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        contentEN: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'products',
    }
);

// --- Service Model (Hizmetler) ---
interface ServiceAttributes {
    id: number;
    slug: string;
    icon: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    contentTR: string;
    contentEN: string;
    sortOrder: number;
    isActive: boolean;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'sortOrder' | 'isActive' | 'contentTR' | 'contentEN'> { }

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
    declare id: number;
    declare slug: string;
    declare icon: string;
    declare titleTR: string;
    declare titleEN: string;
    declare descTR: string;
    declare descEN: string;
    declare contentTR: string;
    declare contentEN: string;
    declare sortOrder: number;
    declare isActive: boolean;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Service.init(
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
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'build',
        },
        titleTR: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        titleEN: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descTR: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        descEN: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contentTR: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        contentEN: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'services',
    }
);

// Relationships - Initialize safely
const initAssociations = () => {
    try {
        // Ensure models are initialized
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

        if (MailingCampaign && MailingLog) {
            MailingCampaign.hasMany(MailingLog, { foreignKey: 'campaignId', as: 'logs' });
            MailingLog.belongsTo(MailingCampaign, { foreignKey: 'campaignId' });
        }

        if (EmailTemplate && MailingCampaign) {
            EmailTemplate.hasMany(MailingCampaign, { sourceKey: 'slug', foreignKey: 'templateSlug', as: 'campaigns' });
            MailingCampaign.belongsTo(EmailTemplate, { targetKey: 'slug', foreignKey: 'templateSlug', as: 'template' });
        }

        console.log('✅ Model associations initialized.');
    } catch (error) {
        // Log but don't crash - allows app to run even if relations fail (e.g. during build)
        console.error('⚠️ Warning: Error initializing model associations (non-critical):', error);
    }
};

// Call association init
initAssociations();
