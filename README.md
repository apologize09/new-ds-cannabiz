# DS Cannabiz

Cannabis hardware and packaging web app for DS Cannabiz. The application includes a product catalog, hardware gallery, packaging and merchandise customization flows, account areas, quote requests, sales lead capture, and subscription billing integration.

DS Cannabiz 大麻硬件与包装 Web 应用。该项目包含产品目录、硬件展示、包装和周边定制流程、用户账户、询价请求、销售线索收集以及订阅计费集成。

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Stripe
- Pacdora integration hooks

## Setup

1. Install dependencies:

```sh
npm install
```

2. Copy the environment example:

```sh
cp .env.example .env.local
```

3. Fill in environment values for the target development or staging environment.

## Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_PACDORA_APP_ID=
VITE_PACDORA_USER_ID=
VITE_PACDORA_SDK_URL=
```

Supabase Edge Functions:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SITE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AI_PROVIDER_API_KEY=
STAFF_NOTIFICATION_WEBHOOK_URL=
PACDORA_APP_ID=
PACDORA_APP_KEY=
```

## Development

```sh
npm run dev
npm run build
npm run preview
```

## Supabase

The `supabase/` directory contains local configuration, migrations, edge functions, and auth email templates. Secrets should be configured in Supabase or the deployment environment, not committed to this repository.

## Notes for Developers

- `.env.local`, build output, QA screenshots, local reports, and agent/editor state are intentionally ignored.
- The committed source is the minimum developer handoff needed to install, build, and continue development.
- Use `.env.example` as the contract for required runtime configuration.
