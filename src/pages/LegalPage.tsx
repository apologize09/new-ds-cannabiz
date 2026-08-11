const content = {
  privacy: ['Privacy Policy','DS Cannabiz processes account, project, billing, and inquiry information to provide the platform. Private uploads are access-controlled and are not public.'],
  terms: ['Terms of Service','Use of DS Cannabiz is subject to account security, lawful uploads, payment obligations, and platform availability.'],
  refunds: ['Refund Policy','Subscription and credit purchases are handled according to the checkout terms shown at purchase. Contact sales for billing assistance.'],
  acceptable: ['Acceptable Use','Do not upload unlawful content, content you do not have rights to use, malware, or material intended to abuse AI or platform services.'],
} as const
export default function LegalPage({ page }: { page: keyof typeof content }) { const [title, body]=content[page]; return <main className="ds-container min-h-[70vh] py-20"><article className="max-w-3xl"><h1 className="text-4xl font-semibold">{title}</h1><p className="mt-8 leading-8 text-muted">{body}</p></article></main> }
