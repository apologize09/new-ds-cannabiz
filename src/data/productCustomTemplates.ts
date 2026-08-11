export type ProductCustomKind = 'packaging' | 'merchandise'

export interface ProductCustomTemplate {
  id: string
  kind: ProductCustomKind
  name: string
  image: string
  swatches: string[]
  pacdoraMockupId: string
  pacdoraKeyword: string
  keywords: string[]
}

export const packagingTemplates: ProductCustomTemplate[] = [
  { id: '10001029', kind: 'packaging', name: 'Center seal pouch mockup', image: 'packaging-pouch-object.png', swatches: ['Image (PLASTIC_GLOSSY).png', 'Image (WHITE_BOARD).png', 'Image (METAL_GLOSSY).png', 'Image (METAL_MATT).png', '截屏2026-06-29 16.26.05 1.png'], pacdoraMockupId: '10001029', pacdoraKeyword: 'center seal pouch', keywords: ['center seal pouch', 'pouch', 'bag', 'packaging', 'plastic glossy', 'white paperboard', 'dieline', 'cr packaging'] },
  { id: '10001030', kind: 'packaging', name: 'Drawer gift box mockup', image: '12539375 1.png', swatches: ['Image (METAL_MATT).png'], pacdoraMockupId: '10001030', pacdoraKeyword: 'drawer gift box', keywords: ['drawer gift box', 'gift box', 'box', 'packaging', 'paperboard', 'rigid box'] },
  { id: '10001031', kind: 'packaging', name: 'FEFCO 0300 box with lid mockup', image: '12696258 1.png', swatches: ['截屏2026-06-29 16.26.05 1.png', 'Image (WHITE_BOARD).png'], pacdoraMockupId: '10001031', pacdoraKeyword: 'box with lid', keywords: ['fefco 0300', 'box with lid', 'box', 'packaging', 'white board', 'folding carton'] },
  { id: '10001032', kind: 'packaging', name: 'Drawer gift box mockup', image: '12516435 1.png', swatches: ['截屏2026-06-29 16.26.05 1.png', 'Image (WHITE_BOARD).png'], pacdoraMockupId: '10001032', pacdoraKeyword: 'drawer box', keywords: ['drawer box', 'gift box', 'slide box', 'packaging', 'paperboard'] },
  { id: '10001033', kind: 'packaging', name: 'Cigarette box mockup', image: '12516435 1.png', swatches: ['Image (PLASTIC_GLOSSY).png'], pacdoraMockupId: '10001033', pacdoraKeyword: 'cigarette box', keywords: ['cigarette box', 'carton', 'vape packaging', 'pre roll box', 'packaging'] },
  { id: '10001034', kind: 'packaging', name: 'Hanging tall flat medicine box mockup', image: '12539375 1.png', swatches: ['Image (METAL_MATT).png', '截屏2026-06-29 16.26.05 1.png'], pacdoraMockupId: '10001034', pacdoraKeyword: 'hanging box', keywords: ['hanging box', 'medicine box', 'retail box', 'flat box', 'packaging', 'merchandise packaging'] },
]

export const merchandiseTemplates: ProductCustomTemplate[] = [
  { id: '10001029', kind: 'merchandise', name: 'Oversized Hoodie Mockup', image: '使用工具生成图片 (21) 1.png', swatches: [], pacdoraMockupId: 'M0042', pacdoraKeyword: 'hoodie', keywords: ['oversized hoodie', 'hoodie', 'sweatshirt', 'apparel', 'merchandise', 'logo print'] },
  { id: '10001030', kind: 'merchandise', name: 'Tote Bag Mockup', image: '新对话 (7) 1.png', swatches: [], pacdoraMockupId: 'M0043', pacdoraKeyword: 'tote bag', keywords: ['tote bag', 'bag', 'canvas bag', 'merchandise', 'logo print'] },
  { id: '10001031', kind: 'merchandise', name: 'Baseball Cap With Hook Mockup', image: '抠图 (5) 1.png', swatches: [], pacdoraMockupId: 'M0044', pacdoraKeyword: 'baseball cap', keywords: ['baseball cap', 'cap', 'hat', 'hook', 'merchandise', 'logo print'] },
  { id: '10001032', kind: 'merchandise', name: "Women's Crop Tank Top Mockup", image: '12621435 2.png', swatches: [], pacdoraMockupId: 'M0045', pacdoraKeyword: 'tank top', keywords: ['crop tank top', 'tank top', 'women apparel', 'shirt', 'merchandise', 'logo print'] },
  { id: '10001033', kind: 'merchandise', name: "Men's Round Neck T-Shirt Mockup", image: '新对话 (6) 1.png', swatches: [], pacdoraMockupId: 'M0046', pacdoraKeyword: 't shirt', keywords: ['round neck t-shirt', 't shirt', 'tee', 'apparel', 'merchandise', 'logo print'] },
  { id: '10001034', kind: 'merchandise', name: 'Wristband Mockup', image: '13310424 2.png', swatches: [], pacdoraMockupId: 'M0047', pacdoraKeyword: 'wristband', keywords: ['wristband', 'band', 'bracelet', 'event merch', 'merchandise', 'logo print'] },
]

export const productCustomTemplates = [...packagingTemplates, ...merchandiseTemplates]

export function getProductCustomTemplates(kind: ProductCustomKind) {
  return kind === 'packaging' ? packagingTemplates : merchandiseTemplates
}

export function findProductCustomTemplate(kind: ProductCustomKind, id?: string) {
  return getProductCustomTemplates(kind).find((template) => template.id === id) ?? getProductCustomTemplates(kind)[0]
}
