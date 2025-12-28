# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Friday seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to protect users until a fix is available.

### 2. Email Security Team

Please email security concerns to: **sjlouji10@gmail.com**

Include the following information:
- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity, but we aim to address critical issues within 30 days

### 4. Disclosure Policy

- We will acknowledge receipt of your report within 48 hours
- We will keep you informed of our progress
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using Friday, please follow these security recommendations:

1. **Keep Dependencies Updated**: Regularly update all dependencies
2. **Use HTTPS**: Always use HTTPS in production
3. **Secure Configuration**: Keep sensitive configuration in environment variables
4. **Regular Backups**: Maintain regular backups of your Beancount files
5. **Access Control**: Implement proper access control if deploying publicly
6. **Environment Variables**: Never commit secrets or API keys to version control

## Known Security Considerations

- Friday is designed for personal use and local deployment
- For production deployments, ensure proper authentication and authorization
- Beancount files may contain sensitive financial information - handle with care
- The application does not include built-in authentication - implement your own if needed

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and will be documented in:
- GitHub Releases
- CHANGELOG.md (if applicable)
- Security advisories on GitHub

## Thank You

We appreciate your help in keeping Friday secure for all users!

