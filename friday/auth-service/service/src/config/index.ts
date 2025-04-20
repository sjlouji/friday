export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  saml: {
    enabled: process.env.SAML_ENABLED === 'true',
    idpMetadataUrl: process.env.SAML_IDP_METADATA_URL || '',
    idpEntityId: process.env.SAML_IDP_ENTITY_ID || '',
    spEntityId: process.env.SAML_SP_ENTITY_ID || '',
    assertionConsumerServiceUrl: process.env.SAML_ACS_URL || '',
    certificate: process.env.SAML_CERTIFICATE || '',
    privateKey: process.env.SAML_PRIVATE_KEY || ''
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  logLevel: process.env.LOG_LEVEL || 'info'
};