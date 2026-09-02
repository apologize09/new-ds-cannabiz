import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const legalBodyClass = 'dsc-legal-page__body mt-8 space-y-8 leading-8'
const legalSectionClass = 'space-y-4'
const legalHeadingClass = 'text-xl font-semibold'

const termsContent = (
  <div className={legalBodyClass}>
    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Overview</h2>
      <p>
        This website is operated by DS Cannabiz. Throughout the site, the terms &ldquo;we&rdquo;,
        &ldquo;us&rdquo; and &ldquo;our&rdquo; refer to DS Cannabiz. DS Cannabiz offers this
        website, including all information, tools and Services available from this site to you, the
        user, conditioned upon your acceptance of all terms, conditions, policies and notices stated
        here.
      </p>
      <p>
        By visiting our site and using our Services, you engage in our &ldquo;Service&rdquo; and
        agree to be bound by the following terms and conditions (&ldquo;Terms of Service&rdquo;,
        &ldquo;Terms&rdquo;), including those additional terms and conditions and policies
        referenced herein and/or available by hyperlink. These Terms of Service apply to all users of
        the site, including without limitation users who are browsers, vendors, customers, merchants,
        and/or contributors of content.
      </p>
      <p>
        Please read these Terms of Service carefully before accessing or using our website. By
        accessing or using any part of the site, you agree to be bound by these Terms of Service. If
        you do not agree to all the terms and conditions of this agreement, then you may not access
        the website or use any Services. If these Terms of Service are considered an offer,
        acceptance is expressly limited to these Terms of Service.
      </p>
      <p>
        Any new features or tools which are added to the current website shall also be subject to the
        Terms of Service. You can review the most current version of the Terms of Service at any time
        on this page. We reserve the right to update, change or replace any part of these Terms of
        Service by posting updates and/or changes to our website. It is your responsibility to check
        this page periodically for changes. Your continued use of or access to the website following
        the posting of any changes constitutes acceptance of those changes.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 1 – General Conditions</h2>
      <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
      <p>
        You understand that your content (not including credit card information), may be transferred
        unencrypted and involve (a) transmissions over various networks; and (b) changes to conform
        and adapt to technical requirements of connecting networks or devices. Credit card
        information is always encrypted during transfer over networks.
      </p>
      <p>
        You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the
        Service, use of the Service, or access to the Service or any contact on the website through
        which the service is provided, without express written permission by us.
      </p>
      <p>
        The headings used in this agreement are included for convenience only and will not limit or
        otherwise affect these Terms.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>
        Section 2 – Accuracy, Completeness and Timeliness of Information
      </h2>
      <p>
        We are not responsible if information made available on this site is not accurate, complete
        or current. The material on this site is provided for general information only and should not
        be relied upon or used as the sole basis for making decisions without consulting primary,
        more accurate, more complete or more timely sources of information. Any reliance on the
        material on this site is at your own risk.
      </p>
      <p>
        This site may contain certain historical information. Historical information, necessarily, is
        not current and is provided for your reference only. We reserve the right to modify the
        contents of this site at any time, but we have no obligation to update any information on our
        site. You agree that it is your responsibility to monitor changes to our site.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 3 – Modifications to the Service and Prices</h2>
      <p>Prices for our products are subject to change without notice.</p>
      <p>
        We reserve the right at any time to modify or discontinue the Service (or any part or content
        thereof) without notice at any time.
      </p>
      <p>
        We shall not be liable to you or to any third-party for any modification, price change,
        suspension or discontinuance of the Service.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 4 – Optional Tools</h2>
      <p>
        We may provide you with access to third-party tools over which we neither monitor nor have
        any control nor input.
      </p>
      <p>
        You acknowledge and agree that we provide access to such tools &rdquo;as is&rdquo; and
        &ldquo;as available&rdquo; without any warranties, representations or conditions of any kind
        and without any endorsement. We shall have no liability whatsoever arising from or relating
        to your use of optional third-party tools.
      </p>
      <p>
        Any use by you of the optional tools offered through the site is entirely at your own risk
        and discretion and you should ensure that you are familiar with and approve of the terms on
        which tools are provided by the relevant third-party provider(s).
      </p>
      <p>
        We may also, in the future, offer new Services and/or features through the website (including
        the release of new tools and resources). Such new features and/or Services shall also be
        subject to these Terms of Service.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 5 – Third-Party Links</h2>
      <p>
        Certain content, products and Services available via our Service may include materials from
        third-parties.
      </p>
      <p>
        Third-party links on this site may direct you to third-party websites that are not affiliated
        with us. We are not responsible for examining or evaluating the content or accuracy and we
        do not warrant and will not have any liability or responsibility for any third-party
        materials or websites, or for any other materials, products, or Services of third-parties.
      </p>
      <p>
        We are not liable for any harm or damages related to the purchase or use of goods, Services,
        resources, content, or any other transactions made in connection with any third-party
        websites. Please review carefully the third-party&apos;s policies and practices and make sure
        you understand them before you engage in any transaction. Complaints, claims, concerns, or
        questions regarding third-party products should be directed to the third-party.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>
        Section 6 – User Comments, Feedback and Other Submissions
      </h2>
      <p>
        If, at our request, you send certain specific submissions (for example contest entries) or
        without a request from us you send creative ideas, suggestions, proposals, plans, or other
        materials, whether online, by email, by postal mail, or otherwise (collectively,
        &lsquo;comments&rsquo;), you agree that we may, at any time, without restriction, edit,
        copy, publish, distribute, translate and otherwise use in any medium any comments that you
        forward to us. We are and shall be under no obligation (1) to maintain any comments in
        confidence; (2) to pay compensation for any comments; or (3) to respond to any comments.
      </p>
      <p>
        We may, but have no obligation to, monitor, edit or remove content that we determine in our
        sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic,
        obscene or otherwise objectionable or violates any party&apos;s intellectual property or
        these Terms of Service.
      </p>
      <p>
        You agree that your comments will not violate any right of any third-party, including
        copyright, trademark, privacy, personality or other personal or proprietary right. You further
        agree that your comments will not contain libelous or otherwise unlawful, abusive or obscene
        material, or contain any computer virus or other malware that could in any way affect the
        operation of the Service or any related website. You may not use a false e-mail address,
        pretend to be someone other than yourself, or otherwise mislead us or third-parties as to
        the origin of any comments. You are solely responsible for any comments you make and their
        accuracy. We take no responsibility and assume no liability for any comments posted by you
        or any third-party.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 7 – Personal Information</h2>
      <p>
        Your submission of personal information through the website is governed by our{' '}
        <Link to="/privacy" className="hover:underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 8 – Errors, Inaccuracies and Omissions</h2>
      <p>
        Occasionally there may be information on our site or in the Service that contains
        typographical errors, inaccuracies or omissions that may relate to product descriptions,
        pricing, promotions, offers, product shipping charges, transit times and availability. We
        reserve the right to correct any errors, inaccuracies or omissions, and to change or update
        information or cancel orders if any information in the Service or on any related website is
        inaccurate at any time without prior notice (including after you have submitted your order).
      </p>
      <p>
        We undertake no obligation to update, amend or clarify information in the Service or on any
        related website, including without limitation, pricing information, except as required by
        law. No specified update or refresh date applied in the Service or on any related website,
        should be taken to indicate that all information in the Service or on any related website
        has been modified or updated.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 9 – Prohibited Uses</h2>
      <p>
        In addition to other prohibitions as set forth in the Terms of Service, you are prohibited
        from using the site or its content:
      </p>
      <p>
        (a) for any unlawful purpose; (b) to solicit others to perform or participate in any
        unlawful acts; (c) to violate any international, federal, provincial or state regulations,
        rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property
        rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm,
        defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation,
        religion, ethnicity, race, age, national origin, or disability; (f) to submit false or
        misleading information; (g) to upload or transmit viruses or any other type of malicious
        code that will or may be used in any way that will affect the functionality or operation of
        the Service or of any related website, other websites, or the Internet; (h) to collect or
        track the personal information of others; (i) to spam, phish, pharm, pretext, spider,
        crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or
        circumvent the security features of the Service or any related website, other websites, or
        the Internet. We reserve the right to terminate your use of the Service or any related
        website for violating any of the prohibited uses.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>
        Section 10 – Disclaimer of Warranties; Limitation of Liability
      </h2>
      <p>
        We do not guarantee, represent or warrant that your use of our service will be uninterrupted,
        timely, secure or error-free.
      </p>
      <p>
        We do not warrant that the results that may be obtained from the use of the service will be
        accurate or reliable.
      </p>
      <p>
        You agree that from time to time we may remove the service for indefinite periods of time or
        cancel the service at any time, without notice to you.
      </p>
      <p>
        You expressly agree that your use of, or inability to use, the service is at your sole risk.
        The service and all products and Services delivered to you through the service are (except
        as expressly stated by us) provided &lsquo;as is&rsquo; and &lsquo;as available&rsquo; for
        your use, without any representation, warranties or conditions of any kind, either express
        or implied, including all implied warranties or conditions of merchantability, merchantable
        quality, fitness for a particular purpose, durability, title, and non-infringement.
      </p>
      <p>
        In no case shall DS Cannabiz, our directors, officers, employees, affiliates, agents,
        contractors, interns, suppliers, service providers or licensors be liable for any injury, loss,
        claim, or any direct, indirect, incidental, punitive, special, or consequential damages of
        any kind, including, without limitation lost profits, lost revenue, lost savings, loss of
        data, replacement costs, or any similar damages, whether based in contract, tort (including
        negligence), strict liability or otherwise, arising from your use of any of the service or
        any products procured using the service, or for any other claim related in any way to your
        use of the service or any product, including, but not limited to, any errors or omissions in
        any content, or any loss or damage of any kind incurred as a result of the use of the service
        or any content (or product) posted, transmitted, or otherwise made available via the service,
        even if advised of their possibility.
      </p>
      <p>
        Because some states or jurisdictions do not allow the exclusion or the limitation of
        liability for consequential or incidental damages, in such states or jurisdictions, our
        liability shall be limited to the maximum extent permitted by law.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 11 – Indemnification</h2>
      <p>
        You agree to indemnify, defend and hold harmless DS Cannabiz and our parent, subsidiaries,
        affiliates, partners, officers, directors, agents, contractors, licensors, service providers,
        subcontractors, suppliers, interns and employees, harmless from any claim or demand,
        including reasonable attorneys&apos; fees, made by any third-party due to or arising out of
        your breach of these Terms of Service or the documents they incorporate by reference, or
        your violation of any law or the rights of a third-party.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 12 – Severability</h2>
      <p>
        In the event that any provision of these Terms of Service is determined to be unlawful, void
        or unenforceable, such provision shall nonetheless be enforceable to the fullest extent
        permitted by applicable law, and the unenforceable portion shall be deemed to be severed from
        these Terms of Service, such determination shall not affect the validity and enforceability
        of any other remaining provisions.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 13 – Termination</h2>
      <p>
        The obligations and liabilities of the parties incurred prior to the termination date shall
        survive the termination of this agreement for all purposes.
      </p>
      <p>
        These Terms of Service are effective unless and until terminated by either you or us. You may
        terminate these Terms of Service at any time by notifying us that you no longer wish to use
        our Services, or when you cease using our site.
      </p>
      <p>
        If in our sole judgment you fail, or we suspect that you have failed, to comply with any term
        or provision of these Terms of Service, we also may terminate this agreement at any time
        without notice and you will remain liable for all amounts due up to and including the date of
        termination; and/or accordingly may deny you access to our Services (or any part thereof).
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 14 – Entire Agreement</h2>
      <p>
        The failure of us to exercise or enforce any right or provision of these Terms of Service
        shall not constitute a waiver of such right or provision.
      </p>
      <p>
        These Terms of Service and any policies or operating rules posted by us on this site or in
        respect to The Service constitutes the entire agreement and understanding between you and us
        and govern your use of the Service, superseding any prior or contemporaneous agreements,
        communications and proposals, whether oral or written, between you and us (including, but not
        limited to, any prior versions of the Terms of Service).
      </p>
      <p>
        Any ambiguities in the interpretation of these Terms of Service shall not be construed
        against the drafting party.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 15 – Governing Law</h2>
      <p>
        These Terms of Service and any separate agreements whereby we provide you Services shall be
        governed by and construed in accordance with the laws of United States.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 16 – Changes to Terms of Service</h2>
      <p>
        You can review the most current version of the Terms of Service at any time at this page.
      </p>
      <p>
        We reserve the right, at our sole discretion, to update, change or replace any part of these
        Terms of Service by posting updates and changes to our website. It is your responsibility to
        check our website periodically for changes. Your continued use of or access to our website
        or the Service following the posting of any changes to these Terms of Service constitutes
        acceptance of those changes.
      </p>
    </section>

    <section className={legalSectionClass}>
      <h2 className={legalHeadingClass}>Section 17 – Contact Information</h2>
      <p>Questions about the Terms of Service should be sent to us at info@weedevice.com.</p>
      <p>Our contact information is posted below:</p>
      <p>
        DS Cannabiz
        <br />
        info@weedevice.com
        <br />
        +1 (800) 123-4567
        <br />
        Los Angeles, CA, United States
      </p>
    </section>
  </div>
)

const privacyContent = (
  <div className={legalBodyClass}>
    <p>
      At DS Cannabiz, accessible from{' '}
      <a href="https://dscannabiz.com/" className="hover:underline underline-offset-2">
        https://dscannabiz.com/
      </a>
      , one of our main priorities is the privacy of our visitors. This Privacy Policy document
      contains types of information that is collected and recorded by DS Cannabiz and how we use it.
    </p>
    <p>
      If you have additional questions or require more information about our Privacy Policy, do not
      hesitate to contact us.
    </p>
    <p>
      This Privacy Policy applies only to our online activities and is valid for visitors to our
      website with regards to the information that they shared and/or collect in DS Cannabiz. This
      policy is not applicable to any information collected offline or via channels other than this
      website.
    </p>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Consent</h2>
      <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Information we collect</h2>
      <p>
        The personal information that you are asked to provide, and the reasons why you are asked to
        provide it, will be made clear to you at the point we ask you to provide your personal
        information.
      </p>
      <p>
        If you contact us directly, we may receive additional information about you such as your
        name, email address, phone number, the contents of the message and/or attachments you may
        send us, and any other information you may choose to provide.
      </p>
      <p>
        When you register for an Account, we may ask for your contact information, including items
        such as name, company name, address, email address, and telephone number.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">How we use your information</h2>
      <p>We use the information we collect in various ways, including to:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Provide, operate, and maintain our website</li>
        <li>Improve, personalize, and expand our website</li>
        <li>Understand and analyze how you use our website</li>
        <li>Develop new products, services, features, and functionality</li>
        <li>
          Communicate with you, either directly or through one of our partners, including for
          customer service, to provide you with updates and other information relating to the
          website, and for marketing and promotional purposes
        </li>
        <li>Send you emails</li>
        <li>Find and prevent fraud</li>
      </ul>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Log Files</h2>
      <p>
        DS Cannabiz follows a standard procedure of using log files. These files log visitors when
        they visit websites. All hosting companies do this and a part of hosting services&apos;
        analytics. The information collected by log files include internet protocol (IP) addresses,
        browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages,
        and possibly the number of clicks. These are not linked to any information that is personally
        identifiable. The purpose of the information is for analyzing trends, administering the
        site, tracking users&apos; movement on the website, and gathering demographic information.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Cookies and Web Beacons</h2>
      <p>
        Like any other website, DS Cannabiz uses &ldquo;cookies&rdquo;. These cookies are used to
        store information including visitors&apos; preferences, and the pages on the website that
        the visitor accessed or visited. The information is used to optimize the users&apos;
        experience by customizing our web page content based on visitors&apos; browser type and/or
        other information.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Google DoubleClick DART Cookie</h2>
      <p>
        Google is one of a third-party vendor on our site. It also uses cookies, known as DART
        cookies, to serve ads to our site visitors based upon their visit to{' '}
        <a href="https://dscannabiz.com/" className="hover:underline underline-offset-2">
          https://dscannabiz.com/
        </a>{' '}
        and other sites on the internet. However, visitors may choose to decline the use of DART
        cookies by visiting the Google ad and content network Privacy Policy at the following URL
        –{' '}
        <a
          href="https://policies.google.com/technologies/ads"
          className="hover:underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          https://policies.google.com/technologies/ads
        </a>
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Our Advertising Partners</h2>
      <p>
        Some of advertisers on our site may use cookies and web beacons. Our advertising partners
        are listed below. Each of our advertising partners has their own Privacy Policy for their
        policies on user data. For easier access, we hyperlinked to their Privacy Policies below.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Advertising Partners Privacy Policies</h2>
      <p>
        You may consult this list to find the Privacy Policy for each of the advertising partners of
        DS Cannabiz.
      </p>
      <p>
        Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web
        Beacons that are used in their respective advertisements and links that appear on DS
        Cannabiz, which are sent directly to users&apos; browser. They automatically receive your IP
        address when this occurs. These technologies are used to measure the effectiveness of their
        advertising campaigns and/or to personalize the advertising content that you see on websites
        that you visit.
      </p>
      <p>
        Note that DS Cannabiz has no access to or control over these cookies that are used by
        third-party advertisers.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Third Party Privacy Policies</h2>
      <p>
        DS Cannabiz&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we
        are advising you to consult the respective Privacy Policies of these third-party ad servers
        for more detailed information. It may include their practices and instructions about how to
        opt-out of certain options.
      </p>
      <p>
        You can choose to disable cookies through your individual browser options. To know more
        detailed information about cookie management with specific web browsers, it can be found at
        the browsers&apos; respective websites.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        CCPA Privacy Rights (Do Not Sell My Personal Information)
      </h2>
      <p>Under the CCPA, among other rights, California consumers have the right to:</p>
      <p>
        Request that a business that collects a consumer&apos;s personal data disclose the
        categories and specific pieces of personal data that a business has collected about
        consumers.
      </p>
      <p>
        Request that a business delete any personal data about the consumer that a business has
        collected.
      </p>
      <p>
        Request that a business that sells a consumer&apos;s personal data, not sell the
        consumer&apos;s personal data.
      </p>
      <p>
        If you make a request, we have one month to respond to you. If you would like to exercise
        any of these rights, please contact us.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">GDPR Data Protection Rights</h2>
      <p>
        We would like to make sure you are fully aware of all of your data protection rights. Every
        user is entitled to the following:
      </p>
      <p>
        <strong>The right to access</strong> – You have the right to request
        copies of your personal data. We may charge you a small fee for this service.
      </p>
      <p>
        <strong>The right to rectification</strong> – You have the right to
        request that we correct any information you believe is inaccurate. You also have the right
        to request that we complete the information you believe is incomplete.
      </p>
      <p>
        <strong>The right to erasure</strong> – You have the right to request
        that we erase your personal data, under certain conditions.
      </p>
      <p>
        <strong>The right to restrict processing</strong> – You have the
        right to request that we restrict the processing of your personal data, under certain
        conditions.
      </p>
      <p>
        <strong>The right to object to processing</strong> – You have the
        right to object to our processing of your personal data, under certain conditions.
      </p>
      <p>
        <strong>The right to data portability</strong> – You have the right to
        request that we transfer the data that we have collected to another organization, or
        directly to you, under certain conditions.
      </p>
      <p>
        If you make a request, we have one month to respond to you. If you would like to exercise
        any of these rights, please contact us.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Children&apos;s Information</h2>
      <p>
        Another part of our priority is adding protection for children while using the internet. We
        encourage parents and guardians to observe, participate in, and/or monitor and guide their
        online activity.
      </p>
      <p>
        DS Cannabiz does not knowingly collect any Personal Identifiable Information from children
        under the age of 13. If you think that your child provided this kind of information on our
        website, we strongly encourage you to contact us immediately and we will do our best efforts
        to promptly remove such information from our records.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. Thus, we advise you to review this page
        periodically for any changes. We will notify you of any changes by posting the new Privacy
        Policy on this page. These changes are effective immediately, after they are posted on this
        page.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Contact Us</h2>
      <p>
        If you have any questions or suggestions about our Privacy Policy, do not hesitate to
        contact us.
      </p>
    </section>
  </div>
)

const content: Record<string, [string, ReactNode]> = {
  privacy: ['Privacy Policy', privacyContent],
  terms: ['Terms of Service', termsContent],
  refunds: [
    'Refund Policy',
    'Subscription and credit purchases are handled according to the checkout terms shown at purchase. Contact sales for billing assistance.',
  ],
  acceptable: [
    'Acceptable Use',
    'Do not upload unlawful content, content you do not have rights to use, malware, or material intended to abuse AI or platform services.',
  ],
}

export default function LegalPage({ page }: { page: keyof typeof content }) {
  const [title, body] = content[page]

  return (
    <main className="ds-container min-h-[70vh] py-20">
      <article className="dsc-legal-page max-w-5xl">
        <h1 className="text-4xl font-semibold">{title}</h1>
        {typeof body === 'string' ? (
          <p className="mt-8 leading-8">{body}</p>
        ) : (
          body
        )}
      </article>
    </main>
  )
}
