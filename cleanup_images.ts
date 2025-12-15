const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize('postgres://default:Ahn1x7WwXkIr@ep-spring-shape-a4362145-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require', {
  dialect: 'postgres',
  logging: false,
});

const EmailTemplate = sequelize.define('EmailTemplate', {
  slug: { type: DataTypes.STRING, unique: true },
  headerImage: { type: DataTypes.TEXT }, // Large text/Base64
  bannerImage: { type: DataTypes.TEXT },
});

async function cleanup() {
  try {
    const template = await EmailTemplate.findOne({ where: { slug: 'new-year' } });
    if (template) {
      console.log('Found new-year template.');
      
      // Clear the corrupted Base64 image data
      // This forces the app to use the default URL defined in email-templates.ts
      template.headerImage = '';
      template.bannerImage = ''; // Clear this too just in case
      
      await template.save();
      console.log('CLEANED new-year template images. Now using static defaults.');
    } else {
      console.log('new-year template not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

cleanup();
