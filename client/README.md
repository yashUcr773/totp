# TOTP React UI

A modern React application for generating and verifying Time-based One-Time Passwords (TOTP) with QR code generation.

## Features

- 🔑 **Generate Secret Keys**: Create secure random secrets for TOTP
- 📝 **Manual Secret Input**: Use existing secrets from other authenticator apps
- 📱 **QR Code Generation**: Scan QR codes with any authenticator app (Google Authenticator, Authy, etc.)
- 🔄 **Live TOTP Display**: Real-time TOTP code generation with countdown timer
- ✅ **Code Verification**: Verify TOTP codes against your secret
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🌙 **Dark Mode Support**: Automatically adapts to system theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

## How to Use

### 1. Generate or Enter a Secret

- Click **"Generate New Secret"** to create a random secure secret
- Or enter an existing secret in the **"Enter Existing Secret"** field and click "Use"

### 2. Customize Account Details

- **Account**: Enter the account email or username
- **Issuer**: Enter the service name (e.g., "MyApp", "GitHub")

### 3. Scan QR Code

- Use your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
- Scan the displayed QR code
- The app will start generating TOTP codes

### 4. View Live TOTP Codes

- The current TOTP code is displayed with a countdown timer
- Codes refresh automatically every 30 seconds

### 5. Verify Codes

- Enter a 6-digit code in the **"Verify TOTP Code"** section
- Click **"Verify"** to check if the code is valid
- The app will show whether the code is valid and any time drift

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **qrcode.react** - QR code generation
- **Web Crypto API** - Browser-based cryptography

## Browser Compatibility

The application uses the Web Crypto API for TOTP generation, which is supported in all modern browsers:

- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

## Security Notes

- All cryptographic operations are performed in the browser using the Web Crypto API
- Secrets are never sent to any server
- This is a demonstration application - for production use, ensure proper secret storage and transmission

## License

ISC

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
