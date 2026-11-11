import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions · City Mela',
  description:
    'Terms and conditions for City Mela events, including Little Guwahati Festival: stall bookings, dynamic pricing, registrations, payments, refunds, safety and privacy.',
}

export default function TermsPage() {
  return (
    <div className="terms-page-container">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .terms-page-container {
              --maroon: #7A1F2B;
              --yellow: #FFC93C;
              --cream: #FFF7EE;
              --ink: #1A0F0C;
              --muted: #5A4038;
              --line: #E8D9C9;
              --orange: #FF6B2C;
              --pink: #FF7AC6;
              background: var(--cream);
              color: var(--ink);
              font-family: 'Nunito', Arial, sans-serif;
              font-size: 17px;
              line-height: 1.65;
              min-height: 100vh;
            }
            .terms-page-container * {
              box-sizing: border-box;
            }
            .terms-topbar {
              background: #141210;
              color: #a39b8f;
              padding: 10px 20px;
              border-bottom: 1px solid #2a2622;
              font-size: 14px;
            }
            .terms-topbar .wrap {
              max-width: 860px;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 8px;
            }
            .terms-topbar a {
              color: var(--yellow);
              text-decoration: none;
              font-weight: 800;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .terms-topbar a:hover {
              text-decoration: underline;
            }
            .terms-bunting {
              height: 26px;
              background:
                linear-gradient(135deg, var(--maroon) 25%, transparent 25%) -13px 0/26px 26px,
                linear-gradient(225deg, var(--maroon) 25%, transparent 25%) -13px 0/26px 26px,
                var(--yellow);
            }
            .terms-header {
              background: var(--maroon);
              color: var(--cream);
              padding: 48px 20px 40px;
            }
            .terms-wrap {
              max-width: 860px;
              margin: 0 auto;
              padding: 0 20px;
            }
            .terms-header .terms-wrap {
              padding: 0 20px;
            }
            .terms-kicker {
              font-weight: 900;
              letter-spacing: 4px;
              font-size: 13px;
              color: var(--yellow);
              margin: 0 0 8px;
              text-transform: uppercase;
            }
            .terms-h1 {
              font-family: 'Bagel Fat One', Arial, sans-serif;
              font-weight: 400;
              font-size: clamp(36px, 6vw, 58px);
              line-height: 1.05;
              margin: 0 0 12px;
              color: var(--yellow);
            }
            .terms-header p {
              margin: 0;
              max-width: 640px;
              color: #F5DCC8;
            }
            .terms-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 18px;
            }
            .terms-meta span {
              background: rgba(255, 247, 238, 0.15);
              border-radius: 999px;
              padding: 4px 14px;
              font-size: 14px;
              font-weight: 800;
              color: #FFF7EE;
            }
            .terms-main {
              padding: 36px 20px 60px;
            }
            .terms-summary {
              background: #fff;
              border: 2px solid var(--line);
              border-left: 6px solid var(--yellow);
              border-radius: 14px;
              padding: 20px 24px;
              margin-bottom: 28px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .terms-summary h2 {
              margin-top: 0;
            }
            .terms-summary ul {
              margin: 0;
              padding-left: 20px;
            }
            .terms-summary li {
              margin-bottom: 6px;
            }
            nav.terms-toc {
              background: #fff;
              border: 2px solid var(--line);
              border-radius: 14px;
              padding: 18px 24px;
              margin-bottom: 36px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            nav.terms-toc p {
              margin: 0 0 10px;
              font-weight: 900;
              letter-spacing: 2px;
              font-size: 13px;
              color: var(--maroon);
            }
            nav.terms-toc ol {
              margin: 0;
              padding-left: 22px;
              columns: 2;
              column-gap: 32px;
            }
            nav.terms-toc li {
              margin-bottom: 6px;
            }
            nav.terms-toc a {
              color: var(--ink);
              text-decoration: none;
              font-weight: 700;
            }
            nav.terms-toc a:hover {
              color: var(--maroon);
              text-decoration: underline;
            }
            .terms-section {
              margin-bottom: 34px;
              scroll-margin-top: 24px;
            }
            .terms-section h2 {
              font-family: 'Bagel Fat One', Arial, sans-serif;
              font-weight: 400;
              color: var(--maroon);
              font-size: 28px;
              line-height: 1.15;
              margin: 0 0 12px;
            }
            .terms-section h3 {
              font-size: 18px;
              font-weight: 900;
              margin: 18px 0 6px;
            }
            .terms-section p {
              margin: 0 0 12px;
            }
            ol.terms-clauses {
              padding-left: 0;
              list-style: none;
              counter-reset: c;
              margin: 0;
            }
            ol.terms-clauses > li {
              counter-increment: c;
              position: relative;
              padding-left: 48px;
              margin-bottom: 12px;
            }
            ol.terms-clauses > li::before {
              content: attr(data-n) "." counter(c);
              position: absolute;
              left: 0;
              top: 0;
              font-weight: 900;
              color: var(--maroon);
              font-size: 15px;
            }
            .terms-callout {
              background: #FFF1D6;
              border-radius: 12px;
              padding: 14px 18px;
              margin: 12px 0;
              border-left: 4px solid var(--orange);
            }
            .terms-contact {
              background: var(--maroon);
              color: var(--cream);
              border-radius: 16px;
              padding: 24px 28px;
              margin-top: 36px;
            }
            .terms-contact h2 {
              color: var(--yellow) !important;
            }
            .terms-contact a {
              color: var(--yellow);
              font-weight: 800;
            }
            .terms-footer {
              border-top: 2px solid var(--line);
              padding: 24px 20px 40px;
              font-size: 14px;
              color: var(--muted);
              background: var(--cream);
            }
            @media (max-width: 640px) {
              nav.terms-toc ol {
                columns: 1;
              }
              ol.terms-clauses > li {
                padding-left: 38px;
              }
            }
          `,
        }}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="terms-topbar">
        <div className="wrap">
          <Link href="/">← Back to City Mela Festivals</Link>
          <span>City Mela • Official Terms</span>
        </div>
      </div>

      <div className="terms-bunting" aria-hidden="true"></div>

      <header className="terms-header">
        <div className="terms-wrap">
          <p className="terms-kicker">CITY MELA · CITYMELA.SPACE</p>
          <h1 className="terms-h1">Terms &amp; Conditions</h1>
          <p>
            These terms apply to everyone who visits, registers for, books a
            stall at, partners with or takes part in any City Mela event,
            including Little Guwahati Festival.
          </p>
          <div className="terms-meta">
            <span>Last updated: 11 November 2026</span>
            <span>Applies to all City Mela events</span>
          </div>
        </div>
      </header>

      <main className="terms-wrap terms-main">
        <div className="terms-summary">
          <h2>In short</h2>
          <ul>
            <li>
              <b>Stall prices are dynamic.</b> They change with demand, timing,
              size, location and category, and the price you see when you book is
              the price you pay.
            </li>
            <li>
              <b>Everything is first come, first served.</b> Stalls are allotted
              in the order full payment is received, and activity places in the
              order registrations are completed.
            </li>
            <li>
              <b>Payments are non-refundable</b>, except where we cancel an
              event entirely.
            </li>
            <li>
              <b>Programmes, timings and layouts can change.</b> Stall numbers
              stay provisional until full payment.
            </li>
            <li>
              <b>Parents and guardians are responsible for their children</b>{' '}
              throughout the event.
            </li>
            <li>
              <b>Venue (park) rules and entry tickets apply</b> on top of these
              terms.
            </li>
          </ul>
        </div>

        <nav className="terms-toc" aria-label="Contents">
          <p>CONTENTS</p>
          <ol>
            <li>
              <a href="#about">Who we are</a>
            </li>
            <li>
              <a href="#acceptance">Accepting these terms</a>
            </li>
            <li>
              <a href="#events">Events, programme and changes</a>
            </li>
            <li>
              <a href="#entry">Entry, passes and venue rules</a>
            </li>
            <li>
              <a href="#activities">Activity and competition registrations</a>
            </li>
            <li>
              <a href="#stalls">Stall bookings for vendors</a>
            </li>
            <li>
              <a href="#pricing">Dynamic pricing</a>
            </li>
            <li>
              <a href="#allotment">First come, first served allotment</a>
            </li>
            <li>
              <a href="#vendor-rules">Vendor obligations</a>
            </li>
            <li>
              <a href="#payments">Payments, taxes and refunds</a>
            </li>
            <li>
              <a href="#cancellation">Cancellation and force majeure</a>
            </li>
            <li>
              <a href="#partners">Sponsors and partners</a>
            </li>
            <li>
              <a href="#safety">Safety, children and conduct</a>
            </li>
            <li>
              <a href="#media">Photography and media</a>
            </li>
            <li>
              <a href="#privacy">Your data and privacy</a>
            </li>
            <li>
              <a href="#liability">Liability</a>
            </li>
            <li>
              <a href="#ip">Our names and logos</a>
            </li>
            <li>
              <a href="#law">Governing law and disputes</a>
            </li>
            <li>
              <a href="#changes">Changes to these terms</a>
            </li>
            <li>
              <a href="#contact">Contact us</a>
            </li>
          </ol>
        </nav>

        <section id="about" className="terms-section">
          <h2>1. Who we are</h2>
          <p>
            City Mela is a unit and trade name of{' '}
            <b>YWE Studios (OPC) Private Limited</b>, Guwahati, Assam (GSTIN
            18AACCY1220B1ZX). In these terms, “City Mela”, “we”, “us” and “our”
            mean YWE Studios (OPC) Pvt Ltd. “You” means any visitor, parent or
            guardian, participant, vendor, exhibitor, sponsor, partner or anyone
            using citymela.space.
          </p>
        </section>

        <section id="acceptance" className="terms-section">
          <h2>2. Accepting these terms</h2>
          <ol className="terms-clauses">
            <li data-n="2">
              By using our website, registering, buying a pass, booking a
              stall, paying us or entering an event, you agree to these terms.
            </li>
            <li data-n="2">
              If you register or book on behalf of a child, a family, a school
              or a business, you confirm you are authorised to do so and accept
              these terms on their behalf.
            </li>
            <li data-n="2">
              Event-specific details (dates, venue, rate cards, rules) are
              published on each event page, in booking confirmations and on our
              official WhatsApp. Where they conflict with these terms, the
              event-specific details apply to that event.
            </li>
          </ol>
        </section>

        <section id="events" className="terms-section">
          <h2>3. Events, programme and changes</h2>
          <ol className="terms-clauses">
            <li data-n="3">
              We plan every event carefully, but programmes, performers,
              activities, partners, timings, stage running order and site layouts
              may change before or during the event without notice.
            </li>
            <li data-n="3">
              Timings shown anywhere are indicative. We do not guarantee that
              any performance, activity, competition or workshop will start or
              finish at a particular time.
            </li>
            <li data-n="3">
              Images, illustrations and descriptions in our creatives are for
              promotion and may not show the event exactly as it will be.
            </li>
            <li data-n="3">
              A change to the programme, a performer or a partner is not a
              reason for a refund.
            </li>
          </ol>
        </section>

        <section id="entry" className="terms-section">
          <h2>4. Entry, passes and venue rules</h2>
          <ol className="terms-clauses">
            <li data-n="4">
              Our events are held at public venues managed by government or
              other authorities (for example, parks managed by GMDA).{' '}
              <b>The venue’s own entry ticket, timings and rules apply</b> in
              addition to these terms.
            </li>
            <li data-n="4">
              A family pass or registration with City Mela is a registration
              for our festival activities. It does not replace any venue entry
              ticket unless we clearly say so for that event.
            </li>
            <li data-n="4">
              Entry is subject to capacity, security checks and the instructions
              of our team, volunteers, security staff and venue authorities.
            </li>
            <li data-n="4">
              We may refuse entry to, or remove, anyone who breaks these terms
              or venue rules, behaves unsafely or offensively, or puts others at
              risk, with no refund.
            </li>
            <li data-n="4">
              Passes, registrations and tickets are personal and may not be
              resold.
            </li>
          </ol>
        </section>

        <section id="activities" className="terms-section">
          <h2>5. Activity and competition registrations</h2>
          <ol className="terms-clauses">
            <li data-n="5">
              Places in activities, workshops and competitions are limited and
              are given <b>first come, first served</b>, in the order
              registrations (and payment, where a fee applies) are completed.
            </li>
            <li data-n="5">
              Registration for a child must be completed by a parent or legal
              guardian, who confirms the child’s details are correct and
              consents to the child taking part.
            </li>
            <li data-n="5">
              Age groups and categories (for example, class-wise categories) are
              set by us. We may move a participant to the correct category or
              decline a participant who does not meet the eligibility criteria.
            </li>
            <li data-n="5">
              Fees for paid activities are non-refundable, including for
              no-shows, late arrival or a missed slot, except where we cancel
              the activity.
            </li>
            <li data-n="5">
              Judges’ and organisers’ decisions on results, winners and prizes
              are final. No correspondence will be entered into about results.
            </li>
            <li data-n="5">
              <b>Prizes</b> are as announced, are subject to availability, may
              be provided by our partners and subject to their terms, are
              non-transferable and cannot be exchanged for cash. We may replace
              a prize with one of similar value.
            </li>
            <li data-n="5">
              Content performed or created at our events (songs, poems,
              artwork) must be the participant’s own or suitable for a family
              audience. We may stop any performance we consider unsuitable.
            </li>
            <li data-n="5">
              Schools taking part in inter-school competitions agree to the
              rules shared with them on registration and are responsible for
              supervising their students.
            </li>
          </ol>
        </section>

        <section id="stalls" className="terms-section">
          <h2>6. Stall bookings for vendors</h2>
          <ol className="terms-clauses">
            <li data-n="6">
              A stall booking is made only when we issue a booking confirmation
              and receive the payment it requires. An enquiry, a form
              submission or a conversation is not a booking.
            </li>
            <li data-n="6">
              Each booking is for the stall size, zone (for example, Food Street
              or Market Lane), dates and inclusions stated on your booking
              confirmation.
            </li>
            <li data-n="6">
              Stalls are for the booked vendor only. You may not sublet,
              transfer, share or resell your stall, or let another brand sell
              from it, without our written approval.
            </li>
            <li data-n="6">
              Shared (half) stalls are shared with another vendor chosen by us.
              Both vendors must respect each other’s space, frontage and display.
            </li>
            <li data-n="6">
              You may only sell the products or food you declared when booking.
              Adding new categories needs our approval.
            </li>
          </ol>
        </section>

        <section id="pricing" className="terms-section">
          <h2>7. Dynamic pricing</h2>
          <div className="terms-callout">
            <b>
              Stall prices, partnership fees and some activity fees are set using
              dynamic pricing.
            </b>
          </div>
          <ol className="terms-clauses">
            <li data-n="7">
              Prices may change at any time based on demand, how close the
              booking is to the event, availability, stall size, location within
              the venue, zone, category, inclusions and any offers running at the
              time.
            </li>
            <li data-n="7">
              The price that applies to you is the price stated on your booking
              confirmation or payment request at the time you book.
            </li>
            <li data-n="7">
              Different vendors may pay different prices for similar stalls
              because they booked at different times, under different offers or
              for different categories or locations.{' '}
              <b>
                This is not grounds for a refund, discount, price match or
                complaint.
              </b>
            </li>
            <li data-n="7">
              Discounts, early-bird rates, category offers and special rates
              apply only to the booking they were given for. They do not carry
              over to future events and may not be disclosed as a public rate.
            </li>
            <li data-n="7">
              Rate cards and published prices are indicative and may be
              withdrawn or changed without notice.
            </li>
          </ol>
        </section>

        <section id="allotment" className="terms-section">
          <h2>8. First come, first served allotment</h2>
          <ol className="terms-clauses">
            <li data-n="8">
              Stalls and stall locations are allotted{' '}
              <b>first come, first served, in the order full payment is received</b>
              , not in the order enquiries or forms are submitted.
            </li>
            <li data-n="8">
              Any stall number or location given before full payment is{' '}
              <b>provisional</b>. If full payment is not received by the stated
              deadline, the stall may be released to another vendor and any
              booking amount paid is forfeited.
            </li>
            <li data-n="8">
              We decide the final site layout. We may move a stall to another
              location of similar size and zone for safety, operational,
              sponsor or layout reasons. This is not grounds for a refund.
            </li>
            <li data-n="8">
              When bookings close or a category sells out, we may decline
              further bookings or keep a waiting list.
            </li>
          </ol>
        </section>

        <section id="vendor-rules" className="terms-section">
          <h2>9. Vendor obligations</h2>
          <ol className="terms-clauses">
            <li data-n="9">
              You must hold and comply with all licences, registrations and
              laws that apply to your business, including FSSAI registration for
              food, GST, weights and measures, and consumer protection rules. You
              are solely responsible for the quality, safety, labelling, pricing
              and legality of what you sell.
            </li>
            <li data-n="9">
              You must follow our stall guidelines for each event, including
              that{' '}
              <b>
                food is sold only on Food Street and products only on Market
                Lane
              </b>
              , and the restrictions on LPG, open flames, high-smoke cooking and
              strong-smelling items where these apply.
            </li>
            <li data-n="9">
              You must use only the power supply provided, within its load, and
              get approval for any extra appliance. You are responsible for
              your own equipment, extension boards and safe wiring within your
              stall.
            </li>
            <li data-n="9">
              You must set up and clear your stall within the times we give,
              keep your stall and its surroundings clean, dispose of waste
              properly and leave the space as you found it.
            </li>
            <li data-n="9">
              You must not sell or display tobacco, alcohol, weapons,
              counterfeit goods or anything illegal, unsafe or unsuitable for
              children and families.
            </li>
            <li data-n="9">
              You are responsible for your stock, cash, equipment and staff at
              all times, including overnight between event days. We recommend
              you insure them.
            </li>
            <li data-n="9">
              You are liable for any damage you, your staff or your equipment
              cause to the venue, our property or other people.
            </li>
            <li data-n="9">
              If you break these terms or the stall guidelines, we may ask you
              to stop the activity, remove items or close your stall for the
              rest of the event, <b>without a refund</b>.
            </li>
          </ol>
        </section>

        <section id="payments" className="terms-section">
          <h2>10. Payments, taxes and refunds</h2>
          <ol className="terms-clauses">
            <li data-n="10">
              Payments must be made only to the account, UPI ID or link shown on
              your City Mela booking confirmation, payment request or invoice.
              We are not responsible for money paid to anyone else.
            </li>
            <li data-n="10">
              Prices are exclusive of GST unless stated otherwise. GST is
              charged at the applicable rate and shown on our tax invoice.
            </li>
            <li data-n="10">
              Booking amounts and full payments are{' '}
              <b>non-refundable and non-transferable</b>, including if you
              cancel, withdraw, do not turn up, arrive late or close early, or if
              sales, footfall or weather are not as you expected.
            </li>
            <li data-n="10">
              Where a booking is paid in parts, the balance must be paid by the
              date on your booking confirmation. If it is not, the booking may
              be cancelled and amounts paid forfeited.
            </li>
            <li data-n="10">
              At our discretion, and only in writing, we may offer a credit
              towards a future City Mela event instead. A credit has no cash
              value.
            </li>
            <li data-n="10">
              Any refund we agree to will be made to the original payment
              source, less any payment or bank charges, within 30 days.
            </li>
          </ol>
        </section>

        <section id="cancellation" className="terms-section">
          <h2>11. Cancellation and force majeure</h2>
          <ol className="terms-clauses">
            <li data-n="11">
              If <b>we cancel an entire event</b> for reasons within our control,
              we will refund amounts paid to us for that event, or, if you
              agree, give you a credit for a future event.
            </li>
            <li data-n="11">
              We are not responsible for any delay, change, postponement,
              shortening or cancellation caused by events beyond our reasonable
              control. These include extreme weather, flooding, natural
              disasters, fire, epidemics, government or venue authority orders,
              withdrawal of permissions, civil unrest, strikes, bandhs, security
              threats and failure of public utilities.
            </li>
            <li data-n="11">
              In such cases we may reschedule or relocate the event. Your
              booking will move to the new date or venue. If the event cannot be
              held at all, we may offer a credit for a future event in place of
              a refund.
            </li>
            <li data-n="11">
              We are not liable for any travel, accommodation, stock, staffing
              or other costs you incur, or for loss of sales or profit, if an
              event is changed or cancelled.
            </li>
          </ol>
        </section>

        <section id="partners" className="terms-section">
          <h2>12. Sponsors and partners</h2>
          <ol className="terms-clauses">
            <li data-n="12">
              Sponsorships and partnerships are governed by the proposal,
              confirmation, invoice or agreement for that partnership, together
              with these terms.
            </li>
            <li data-n="12">
              Partner titles and category exclusivity apply only where
              confirmed in writing. Branding is delivered on the materials and
              channels agreed. Materials already printed or published before a
              partner confirms cannot always be changed.
            </li>
            <li data-n="12">
              Partners are responsible for their own activations, staff,
              products, offers and prizes, and for complying with the law and
              venue rules.
            </li>
          </ol>
        </section>

        <section id="safety" className="terms-section">
          <h2>13. Safety, children and conduct</h2>
          <ol className="terms-clauses">
            <li data-n="13">
              <b>Children must be supervised by a parent, guardian or responsible adult at all times</b>
              , including in play areas, workshops, competitions and queues. Our
              team and volunteers do not take over that responsibility.
            </li>
            <li data-n="13">
              Play equipment, trampolines, races and activities are used at
              your own risk and subject to the age, height and safety rules shown
              at each activity and the instructions of the staff running it.
            </li>
            <li data-n="13">
              Please report a lost child immediately at the help desk. We may
              share a child’s description on our public address system to reunite
              them with their family.
            </li>
            <li data-n="13">
              Health check-ups, talks and advice at our events are provided by
              our health partner and its professionals, not by City Mela. They
              are not a substitute for consulting your own doctor.
            </li>
            <li data-n="13">
              You must not bring prohibited items, smoke where it is not
              allowed, consume alcohol or drugs, fly drones without our
              approval, or behave in a way that is abusive, unsafe or
              disruptive.
            </li>
            <li data-n="13">
              We are not responsible for lost, stolen or damaged personal
              belongings. Found items handed in will be kept at the help desk
              during the event.
            </li>
          </ol>
        </section>

        <section id="media" className="terms-section">
          <h2>14. Photography and media</h2>
          <ol className="terms-clauses">
            <li data-n="14">
              Our events are photographed, filmed and may be broadcast or
              streamed by us, our media partners, creators and partners.
            </li>
            <li data-n="14">
              By attending or taking part, you agree that you and the children
              in your care may appear in this content, and that we and our
              partners may use it to report on and promote City Mela events,
              without payment.
            </li>
            <li data-n="14">
              If you do not want a child to be photographed close up, please
              tell our team at the help desk. If you see content you want
              removed, email us and we will take reasonable steps to remove it
              from our own channels.
            </li>
            <li data-n="14">
              Vendors and partners agree that we may photograph their stalls,
              products and branding and use these images to promote our events.
            </li>
          </ol>
        </section>

        <section id="privacy" className="terms-section">
          <h2>15. Your data and privacy</h2>
          <ol className="terms-clauses">
            <li data-n="15">
              We collect the details you give us when you register, book or
              contact us. These may include names, phone and WhatsApp numbers,
              email addresses, a child’s name, age and school, business details
              and payment references.
            </li>
            <li data-n="15">
              We use them to run our events: to confirm registrations and
              bookings, organise activities and categories, contact winners,
              manage entry and safety, issue invoices, and send you updates
              about this and future City Mela events.
            </li>
            <li data-n="15">
              Details of children are collected only with the consent of a
              parent or guardian and are used only to run the activities
              registered for.
            </li>
            <li data-n="15">
              We do not sell your data. We share it only as needed to run the
              event, for example with a partner delivering a prize, workshop or
              health check-up, with our payment and website service providers,
              or where the law requires it.
            </li>
            <li data-n="15">
              You can ask us to correct or delete your data, or stop sending you
              updates, by emailing{' '}
              <a href="mailto:mailcitymela@gmail.com">mailcitymela@gmail.com</a>.
              We handle personal data in line with applicable Indian law,
              including the Digital Personal Data Protection Act, 2023.
            </li>
          </ol>
        </section>

        <section id="liability" className="terms-section">
          <h2>16. Liability</h2>
          <ol className="terms-clauses">
            <li data-n="16">
              You attend and take part in our events at your own risk. To the
              fullest extent the law allows, City Mela is not liable for any
              injury, loss, damage, illness or expense arising from your
              attendance or participation, except where caused by our proven
              negligence.
            </li>
            <li data-n="16">
              We are not responsible for the products, food, services, offers,
              prices or conduct of vendors, partners, performers or other
              attendees. Any claim about a purchase must be made directly with
              the seller.
            </li>
            <li data-n="16">
              We are not liable for any indirect or consequential loss,
              including loss of sales, profit, business or reputation.
            </li>
            <li data-n="16">
              Our total liability to you for any claim is limited to the amount
              you paid us for the booking or registration concerned.
            </li>
            <li data-n="16">
              Nothing in these terms limits any liability that cannot be
              limited under Indian law.
            </li>
          </ol>
        </section>

        <section id="ip" className="terms-section">
          <h2>17. Our names and logos</h2>
          <p>
            “City Mela”, “Little Guwahati Festival”, our event names, logos,
            creatives, website content and designs belong to YWE Studios (OPC)
            Pvt Ltd. You may not use them to suggest an official link with us, or
            in your own promotions, without our written permission. Vendors and
            partners may share our official creatives featuring their brand
            without changes.
          </p>
        </section>

        <section id="law" className="terms-section">
          <h2>18. Governing law and disputes</h2>
          <p>
            These terms are governed by the laws of India. We will always try to
            resolve concerns quickly and amicably; please contact us first. Any
            dispute that cannot be resolved will be subject to the exclusive
            jurisdiction of the courts at Guwahati, Assam.
          </p>
        </section>

        <section id="changes" className="terms-section">
          <h2>19. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The version published
            on this page at the time of your booking or registration applies to
            it. The “Last updated” date at the top shows when the terms were last
            changed. If any part of these terms is found to be unenforceable, the
            rest remains in effect.
          </p>
        </section>

        <section id="contact" className="terms-section terms-contact">
          <h2>20. Contact us</h2>
          <p>
            <b>City Mela</b>, a unit of YWE Studios (OPC) Pvt Ltd, Guwahati,
            Assam
            <br />
            WhatsApp:{' '}
            <a href="https://wa.me/919181051445" target="_blank" rel="noopener noreferrer">
              +91 91810 51445
            </a>
            <br />
            Email:{' '}
            <a href="mailto:mailcitymela@gmail.com">mailcitymela@gmail.com</a>
            <br />
            Website:{' '}
            <a href="https://citymela.space" target="_blank" rel="noopener noreferrer">
              citymela.space
            </a>
          </p>
        </section>
      </main>

      <footer className="terms-footer">
        <div className="terms-wrap">
          © 2026 YWE Studios (OPC) Pvt Ltd · City Mela · All rights reserved.
        </div>
      </footer>
    </div>
  )
}

