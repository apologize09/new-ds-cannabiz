export default function BrandMark({className='h-7 w-7'}:{className?:string}){
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`dsc-brand-mark ${className}`}>
      <path data-dsc-brand-star fill="#26f6c8" stroke="none" d="M20 1l5.3 8.9 10.2-1.6-3.7 9.6 7.1 7.5-10.3 2.2-2.7 10-7-7.6-9.5 4.1 1-10.3L1.7 18l9.1-5L10 2.6l9.4 4.3z"/>
      <rect data-dsc-brand-pill x="10" y="15" width="20" height="11" rx="5.5" fill="#fff" stroke="none"/>
      <ellipse data-dsc-brand-dot cx="15" cy="20.5" rx="2" ry="4" fill="#777" stroke="none"/>
      <ellipse data-dsc-brand-dot cx="20" cy="20.5" rx="2" ry="4" fill="#777" stroke="none"/>
      <ellipse data-dsc-brand-dot cx="25" cy="20.5" rx="2" ry="4" fill="#777" stroke="none"/>
    </svg>
  )
}
