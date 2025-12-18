import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { getDb, connectToDatabase } from './db';

// Lazy load bcrypt to reduce serverless bundle size
// bcrypt is only needed for password operations
const getBcrypt = async () => {
    const bcrypt = await import('bcrypt');
    return bcrypt.default;
};

export { connectToDatabase };

// ===== LAZY INITIALIZATION PATTERN =====
// Cloudflare Pages uyumluluğu için modeller runtime'da initialize edilir
// Build sırasında getDb() null döner, bu durumda modeller initialize edilmez

// Global state for lazy initialization
let modelsInitialized = false;
let sequelizeInstance: Sequelize | null = null;

// ===== BUILD-TIME CHECK =====
const isBuildTime = () => {
    return !process.env.DB_HOST && !process.env.JWT_SECRET;
};

// ===== LAZY MODEL INITIALIZATION =====
const initializeModels = () => {
    if (modelsInitialized) return;

    const sequelize = getDb();
    if (!sequelize) {
        console.warn('⚠️ Database not available, skipping model initialization.');
        return;
    }

    sequelizeInstance = sequelize;

    // HMR Fix: In development, clear models to prevent "Model already defined" error on reload
    if (process.env.NODE_ENV !== 'production') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sequelize as any).modelManager.models = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sequelize as any).models = {};
        } catch (e) {
            console.error("HMR maintenance error:", e);
        }
    }

    // Initialize all models
    initUserModel(sequelize);
    initAddressModel(sequelize);
    initOrderModel(sequelize);
    initAdminUserModel(sequelize);
    initOTPTokenModel(sequelize);
    initMediaFileModel(sequelize);
    initContentPageModel(sequelize);
    initMailingCampaignModel(sequelize);
    initMailingLogModel(sequelize);
    initEmailTemplateModel(sequelize);
    initContactRequestModel(sequelize);
    initSiteAnalyticsModel(sequelize);
    initNotificationReadModel(sequelize);
    initSiteSettingsModel(sequelize);
    initProductModel(sequelize);
    initServiceModel(sequelize);
    initCookieConsentModel(sequelize);
    initPageModel(sequelize);

    // Initialize associations
    initAssociations();

    // Dev sync
    if (process.env.NODE_ENV !== 'production') {
        sequelize.sync({ alter: true }).catch(err => console.error('Sync Error:', err));
    }

    modelsInitialized = true;
    console.log('✅ All models initialized successfully.');
};

// ===== USER MODEL =====
interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    role?: 'user' | 'admin' | 'editor';
    sessionToken?: string;
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

    public async comparePassword(password: string): Promise<boolean> {
        const bcrypt = await getBcrypt();
        return bcrypt.compare(password, this.password_hash);
    }
}

const initUserModel = (sequelize: Sequelize) => {
    User.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            password_hash: { type: DataTypes.STRING, allowNull: false },
            phone: { type: DataTypes.STRING, allowNull: true },
            role: { type: DataTypes.ENUM('user', 'admin', 'editor'), defaultValue: 'user' },
            sessionToken: { type: DataTypes.STRING, allowNull: true },
        },
        {
            sequelize,
            tableName: 'users',
            hooks: {
                beforeCreate: async (user) => {
                    if (user.password_hash) {
                        const bcrypt = await getBcrypt();
                        const salt = await bcrypt.genSalt(10);
                        user.password_hash = await bcrypt.hash(user.password_hash, salt);
                    }
                },
                beforeUpdate: async (user) => {
                    if (user.changed('password_hash')) {
                        const bcrypt = await getBcrypt();
                        const salt = await bcrypt.genSalt(10);
                        user.password_hash = await bcrypt.hash(user.password_hash, salt);
                    }
                },
            },
        }
    );
};

// ===== ADDRESS MODEL =====
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

const initAddressModel = (sequelize: Sequelize) => {
    Address.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            title: { type: DataTypes.STRING, allowNull: false },
            address: { type: DataTypes.TEXT, allowNull: false },
            isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, tableName: 'addresses' }
    );
};

// ===== ORDER MODEL =====
interface OrderAttributes {
    id: number;
    userId: number | null;
    details: string;
    status: 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
    trackingNumber?: string;
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

const initOrderModel = (sequelize: Sequelize) => {
    Order.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            details: { type: DataTypes.TEXT, allowNull: false },
            status: { type: DataTypes.ENUM('PENDING', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'), defaultValue: 'PENDING' },
            trackingNumber: { type: DataTypes.STRING, allowNull: true },
        },
        { sequelize, tableName: 'orders' }
    );
};

// ===== ADMINUSER MODEL =====
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

const initAdminUserModel = (sequelize: Sequelize) => {
    AdminUser.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            role: { type: DataTypes.ENUM('super_admin', 'admin', 'editor'), defaultValue: 'editor' },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
            lastLoginAt: { type: DataTypes.DATE, allowNull: true },
        },
        { sequelize, tableName: 'admin_users' }
    );
};

// ===== OTPTOKEN MODEL =====
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

const initOTPTokenModel = (sequelize: Sequelize) => {
    OTPToken.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            email: { type: DataTypes.STRING, allowNull: false },
            token: { type: DataTypes.STRING(6), allowNull: false },
            expiresAt: { type: DataTypes.DATE, allowNull: false },
            isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, tableName: 'otp_tokens' }
    );
};

// ===== MEDIAFILE MODEL =====
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

const initMediaFileModel = (sequelize: Sequelize) => {
    MediaFile.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            filename: { type: DataTypes.STRING, allowNull: false },
            originalName: { type: DataTypes.STRING, allowNull: false },
            mimeType: { type: DataTypes.STRING, allowNull: false },
            size: { type: DataTypes.INTEGER, allowNull: false },
            url: { type: DataTypes.TEXT, allowNull: false },
            uploadedBy: { type: DataTypes.INTEGER, allowNull: true },
        },
        { sequelize, tableName: 'media_files' }
    );
};

// ===== CONTENTPAGE MODEL =====
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

const initContentPageModel = (sequelize: Sequelize) => {
    ContentPage.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            title: { type: DataTypes.STRING, allowNull: false },
            content: { type: DataTypes.TEXT('long'), allowNull: false },
            metaDescription: { type: DataTypes.TEXT, allowNull: true },
            isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
            publishedAt: { type: DataTypes.DATE, allowNull: true },
            updatedBy: { type: DataTypes.INTEGER, allowNull: true },
        },
        { sequelize, tableName: 'content_pages' }
    );
};

// ===== MAILINGCAMPAIGN MODEL =====
interface MailingCampaignAttributes {
    id: number;
    name: string;
    subject: string;
    content: string;
    templateSlug: string;
    recipientType: 'all' | 'members' | 'guests' | 'custom' | 'external';
    recipientIds?: string;
    externalRecipients?: string;
    customLogoUrl?: string;
    customProductImageUrl?: string;
    campaignTitle?: string;
    campaignHighlight?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    scheduledAt?: Date;
    sentAt?: Date;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    openCount: number;
    clickCount: number;
    errorLog?: string;
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

const initMailingCampaignModel = (sequelize: Sequelize) => {
    MailingCampaign.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            subject: { type: DataTypes.STRING, allowNull: false },
            content: { type: DataTypes.TEXT('long'), allowNull: false },
            templateSlug: { type: DataTypes.STRING, allowNull: false, defaultValue: 'modern' },
            recipientType: { type: DataTypes.ENUM('all', 'members', 'guests', 'custom', 'external'), defaultValue: 'all' },
            recipientIds: { type: DataTypes.TEXT, allowNull: true },
            externalRecipients: { type: DataTypes.TEXT('long'), allowNull: true },
            customLogoUrl: { type: DataTypes.STRING, allowNull: true },
            customProductImageUrl: { type: DataTypes.STRING, allowNull: true },
            campaignTitle: { type: DataTypes.STRING, allowNull: true },
            campaignHighlight: { type: DataTypes.STRING, allowNull: true },
            status: { type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'), defaultValue: 'draft' },
            scheduledAt: { type: DataTypes.DATE, allowNull: true },
            sentAt: { type: DataTypes.DATE, allowNull: true },
            recipientCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            sentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            failedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            openCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            clickCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            errorLog: { type: DataTypes.TEXT('long'), allowNull: true },
        },
        { sequelize, tableName: 'mailing_campaigns' }
    );
};

// ===== MAILINGLOG MODEL =====
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

const initMailingLogModel = (sequelize: Sequelize) => {
    MailingLog.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            campaignId: { type: DataTypes.INTEGER, allowNull: false },
            userEmail: { type: DataTypes.STRING, allowNull: false },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            status: { type: DataTypes.ENUM('sent', 'failed', 'opened', 'clicked'), defaultValue: 'sent' },
            errorMessage: { type: DataTypes.TEXT, allowNull: true },
            sentAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            openedAt: { type: DataTypes.DATE, allowNull: true },
            clickedAt: { type: DataTypes.DATE, allowNull: true },
        },
        { sequelize, tableName: 'mailing_logs' }
    );
};

// ===== EMAILTEMPLATE MODEL =====
interface EmailTemplateAttributes {
    id: number;
    slug: string;
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
    headerTitle?: string;
    bodyContent?: string;
    footerContact?: string;
    buttonText?: string;
    templateData?: any;
    headerHtml: string;
    footerHtml: string;
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

const initEmailTemplateModel = (sequelize: Sequelize) => {
    EmailTemplate.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            nameTR: { type: DataTypes.STRING, allowNull: false },
            nameEN: { type: DataTypes.STRING, allowNull: false },
            category: { type: DataTypes.ENUM('general', 'holiday', 'promotion'), defaultValue: 'general' },
            headerBgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#1a2744' },
            headerTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#ffffff' },
            headerImage: { type: DataTypes.TEXT('long'), allowNull: true },
            bodyBgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#ffffff' },
            bodyTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#333333' },
            buttonColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#b13329' },
            buttonText: { type: DataTypes.STRING, allowNull: true },
            templateData: { type: DataTypes.JSON, allowNull: true },
            footerBgColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#1a2744' },
            footerTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: '#888888' },
            footerImage: { type: DataTypes.TEXT('long'), allowNull: true },
            bannerImage: { type: DataTypes.TEXT('long'), allowNull: true },
            logoUrl: { type: DataTypes.TEXT('long'), allowNull: true },
            headerTitle: { type: DataTypes.STRING, allowNull: true },
            bodyContent: { type: DataTypes.TEXT('long'), allowNull: true },
            footerContact: { type: DataTypes.STRING, allowNull: true },
            headerHtml: { type: DataTypes.TEXT('long'), allowNull: false },
            footerHtml: { type: DataTypes.TEXT('long'), allowNull: false },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
            sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
        },
        { sequelize, tableName: 'email_templates' }
    );
};

// ===== CONTACTREQUEST MODEL =====
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

const initContactRequestModel = (sequelize: Sequelize) => {
    ContactRequest.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            email: { type: DataTypes.STRING, allowNull: false },
            phone: { type: DataTypes.STRING, allowNull: true },
            company: { type: DataTypes.STRING, allowNull: true },
            message: { type: DataTypes.TEXT, allowNull: false },
            status: { type: DataTypes.ENUM('new', 'read', 'replied', 'archived'), defaultValue: 'new' },
            repliedAt: { type: DataTypes.DATE, allowNull: true },
        },
        { sequelize, tableName: 'contact_requests' }
    );
};

// ===== SITEANALYTICS MODEL =====
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

const initSiteAnalyticsModel = (sequelize: Sequelize) => {
    SiteAnalytics.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            date: { type: DataTypes.DATEONLY, allowNull: false },
            pageUrl: { type: DataTypes.STRING, allowNull: false },
            pageViews: { type: DataTypes.INTEGER, defaultValue: 0 },
            uniqueVisitors: { type: DataTypes.INTEGER, defaultValue: 0 },
            bounceRate: { type: DataTypes.FLOAT, allowNull: true },
            avgSessionDuration: { type: DataTypes.INTEGER, allowNull: true },
        },
        {
            sequelize,
            tableName: 'site_analytics',
            indexes: [{ fields: ['date', 'pageUrl'], unique: true }]
        }
    );
};

// ===== NOTIFICATIONREAD MODEL =====
interface NotificationReadAttributes {
    id: number;
    userId: number;
    notificationId: string;
    readAt: Date;
    deletedAt: Date | null;
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

const initNotificationReadModel = (sequelize: Sequelize) => {
    NotificationRead.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            notificationId: { type: DataTypes.STRING, allowNull: false },
            readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            deletedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
        },
        {
            sequelize,
            tableName: 'notification_reads',
            indexes: [{ fields: ['userId', 'notificationId'], unique: true }]
        }
    );
};

// ===== SITESETTINGS MODEL =====
interface SiteSettingsAttributes {
    id: number;
    key: string;
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

const initSiteSettingsModel = (sequelize: Sequelize) => {
    SiteSettings.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            key: { type: DataTypes.STRING, allowNull: false, unique: true },
            value: { type: DataTypes.TEXT, allowNull: false },
            category: { type: DataTypes.ENUM('general', 'contact', 'social', 'seo'), allowNull: false },
            description: { type: DataTypes.STRING, allowNull: true },
        },
        { sequelize, tableName: 'site_settings' }
    );
};

// ===== PRODUCT MODEL =====
interface ProductAttributes {
    id: number;
    slug: string;
    slugEN: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    contentTR: string;
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

const initProductModel = (sequelize: Sequelize) => {
    Product.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            slugEN: { type: DataTypes.STRING, allowNull: false, unique: true },
            titleTR: { type: DataTypes.STRING, allowNull: false },
            titleEN: { type: DataTypes.STRING, allowNull: false },
            descTR: { type: DataTypes.TEXT, allowNull: false },
            descEN: { type: DataTypes.TEXT, allowNull: false },
            contentTR: { type: DataTypes.TEXT('long'), allowNull: true },
            contentEN: { type: DataTypes.TEXT('long'), allowNull: true },
            image: { type: DataTypes.STRING, allowNull: false },
            sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        { sequelize, tableName: 'products' }
    );
};

// ===== SERVICE MODEL =====
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

const initServiceModel = (sequelize: Sequelize) => {
    Service.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            icon: { type: DataTypes.STRING, allowNull: false, defaultValue: 'build' },
            titleTR: { type: DataTypes.STRING, allowNull: false },
            titleEN: { type: DataTypes.STRING, allowNull: false },
            descTR: { type: DataTypes.TEXT, allowNull: false },
            descEN: { type: DataTypes.TEXT, allowNull: false },
            contentTR: { type: DataTypes.TEXT('long'), allowNull: true },
            contentEN: { type: DataTypes.TEXT('long'), allowNull: true },
            sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        { sequelize, tableName: 'services' }
    );
};

// ===== COOKIECONSENT MODEL =====
interface CookieConsentAttributes {
    id: number;
    visitorId: string;
    userId?: number;
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    ipAddress?: string;
    userAgent?: string;
}

interface CookieConsentCreationAttributes extends Optional<CookieConsentAttributes, 'id' | 'userId' | 'ipAddress' | 'userAgent'> { }

export class CookieConsent extends Model<CookieConsentAttributes, CookieConsentCreationAttributes> implements CookieConsentAttributes {
    declare id: number;
    declare visitorId: string;
    declare userId: number | undefined;
    declare necessary: boolean;
    declare analytics: boolean;
    declare marketing: boolean;
    declare functional: boolean;
    declare ipAddress: string | undefined;
    declare userAgent: string | undefined;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

const initCookieConsentModel = (sequelize: Sequelize) => {
    CookieConsent.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            visitorId: { type: DataTypes.STRING(36), allowNull: false, unique: true },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            necessary: { type: DataTypes.BOOLEAN, defaultValue: true },
            analytics: { type: DataTypes.BOOLEAN, defaultValue: false },
            marketing: { type: DataTypes.BOOLEAN, defaultValue: false },
            functional: { type: DataTypes.BOOLEAN, defaultValue: false },
            ipAddress: { type: DataTypes.STRING(45), allowNull: true },
            userAgent: { type: DataTypes.TEXT, allowNull: true },
        },
        { sequelize, tableName: 'cookie_consents' }
    );
};

// ===== PAGE MODEL =====
interface PageAttributes {
    id: number;
    slug: string;
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
    status: 'published' | 'draft';
    type: 'legal' | 'static' | 'dynamic';
    metaTitle?: string;
    metaDescription?: string;
    isSystemPage: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PageCreationAttributes extends Optional<PageAttributes, 'id'> { }

export class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes {
    declare id: number;
    declare slug: string;
    declare title: string;
    declare titleEn: string | undefined;
    declare content: string;
    declare contentEn: string | undefined;
    declare status: 'published' | 'draft';
    declare type: 'legal' | 'static' | 'dynamic';
    declare metaTitle: string | undefined;
    declare metaDescription: string | undefined;
    declare isSystemPage: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

const initPageModel = (sequelize: Sequelize) => {
    Page.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            title: { type: DataTypes.STRING, allowNull: false },
            titleEn: { type: DataTypes.STRING, allowNull: true },
            content: { type: DataTypes.TEXT('long'), allowNull: false },
            contentEn: { type: DataTypes.TEXT('long'), allowNull: true },
            status: { type: DataTypes.ENUM('published', 'draft'), defaultValue: 'published' },
            type: { type: DataTypes.ENUM('legal', 'static', 'dynamic'), defaultValue: 'static' },
            metaTitle: { type: DataTypes.STRING, allowNull: true },
            metaDescription: { type: DataTypes.TEXT, allowNull: true },
            isSystemPage: { type: DataTypes.BOOLEAN, defaultValue: false },
        },
        { sequelize, tableName: 'pages' }
    );
};

// ===== ASSOCIATIONS =====
const initAssociations = () => {
    try {
        User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
        Address.belongsTo(User, { foreignKey: 'userId' });

        User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
        Order.belongsTo(User, { foreignKey: 'userId' });

        AdminUser.hasMany(MediaFile, { foreignKey: 'uploadedBy', as: 'uploadedFiles' });
        MediaFile.belongsTo(AdminUser, { foreignKey: 'uploadedBy' });

        AdminUser.hasMany(ContentPage, { foreignKey: 'updatedBy', as: 'editedPages' });
        ContentPage.belongsTo(AdminUser, { foreignKey: 'updatedBy' });

        MailingCampaign.hasMany(MailingLog, { foreignKey: 'campaignId', as: 'logs' });
        MailingLog.belongsTo(MailingCampaign, { foreignKey: 'campaignId' });

        EmailTemplate.hasMany(MailingCampaign, { sourceKey: 'slug', foreignKey: 'templateSlug', as: 'campaigns' });
        MailingCampaign.belongsTo(EmailTemplate, { targetKey: 'slug', foreignKey: 'templateSlug', as: 'template' });

        console.log('✅ Model associations initialized.');
    } catch (error) {
        console.error('⚠️ Warning: Error initializing model associations:', error);
    }
};

// ===== ENSURE MODELS ARE INITIALIZED =====
// This function should be called before any database operation
export const ensureModels = () => {
    if (!modelsInitialized) {
        initializeModels();
    }
    return modelsInitialized;
};

// Build-time safe: Only initialize if not in build mode
if (!isBuildTime()) {
    initializeModels();
} else {
    console.log('⚠️ Build-time detected, deferring model initialization to runtime.');
}
