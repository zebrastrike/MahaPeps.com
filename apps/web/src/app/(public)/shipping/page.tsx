export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold text-clinical-white">Shipping Policy</h1>

      <div className="space-y-6 text-charcoal-200">
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">1. Shipping Locations</h2>
          <p className="mb-3">
            MAHA Peptides currently ships <strong>only within the United States</strong>. We do not ship internationally or to US territories.
          </p>
          <p className="mb-3"><strong>We reserve the right to refuse shipment to any address or jurisdiction at our sole discretion.</strong></p>
          <p>
            Certain products may be restricted in specific states due to local regulations. It is your responsibility to ensure that receipt of
            research chemicals is legal in your jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">2. Shipping Methods and Carriers</h2>
          <p className="mb-3">We ship via USPS, FedEx, or UPS based on:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Package weight and dimensions</li>
            <li>Destination address</li>
            <li>Selected processing speed</li>
            <li>Carrier availability</li>
          </ul>
          <p className="mt-3">
            Shipping carrier selection is at our discretion. You may not request a specific carrier.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">3. Processing Times</h2>
          <p className="mb-3">
            <strong>Processing begins ONLY after payment is verified.</strong> Processing time is the time required to prepare your order for shipment,
            NOT the shipping transit time.
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-charcoal-600 bg-charcoal-900/50 p-4">
              <h3 className="font-bold text-clinical-white mb-2">STANDARD Processing (FREE)</h3>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li><strong>Processing Time:</strong> 2 business days after payment verification</li>
                <li><strong>Ships:</strong> Monday - Friday (excluding holidays)</li>
                <li><strong>Cost:</strong> Included at no additional charge</li>
              </ul>
            </div>

            <div className="rounded-lg border border-accent-500 bg-accent-500/10 p-4">
              <h3 className="font-bold text-accent-200 mb-2">EXPEDITED Processing ($25)</h3>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li><strong>Processing Time:</strong> 1 business day after payment verification</li>
                <li><strong>Ships:</strong> Next business day</li>
                <li><strong>Cost:</strong> $25 (non-refundable)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-500 bg-amber-500/10 p-4">
              <h3 className="font-bold text-amber-200 mb-2">RUSH Processing ($50)</h3>
              <ul className="list-disc space-y-1 pl-6 text-sm">
                <li><strong>Processing Time:</strong> Same business day if payment verified before 10:00 AM MST (Arizona Time)</li>
                <li><strong>Ships:</strong> Same day or next business day</li>
                <li><strong>Cost:</strong> $50 (non-refundable)</li>
                <li><strong>Cutoff:</strong> 10:00 AM MST sharp - no exceptions</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-500/10 p-4">
            <p className="font-bold text-red-200">IMPORTANT TIMING NOTES:</p>
            <ul className="mt-2 space-y-1 text-red-100">
              <li>• <strong>Weekend Orders:</strong> Orders placed Friday evening through Sunday will be processed on Monday</li>
              <li>• <strong>Holiday Delays:</strong> Orders placed on or before holidays will be processed on next business day</li>
              <li>• <strong>Payment Timing:</strong> Processing time begins when WE verify your payment, not when you send it</li>
              <li>• <strong>10am MST Cutoff:</strong> Based on Arizona time (no daylight saving time)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">4. Shipping Costs</h2>
          <p className="mb-3">
            Shipping costs are calculated at checkout based on:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Package weight and dimensions</li>
            <li>Destination zip code</li>
            <li>Selected carrier service level</li>
          </ul>
          <p className="mt-3">
            <strong>Shipping costs are NON-REFUNDABLE.</strong> Processing fees (Expedited/Rush) are also non-refundable.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">5. Shipping Insurance (HIGHLY RECOMMENDED)</h2>
          <div className="rounded-lg border-2 border-accent-500 bg-accent-500/10 p-4 mb-4">
            <p className="font-bold text-accent-200">PROTECT YOUR ORDER</p>
            <p className="mt-2 text-accent-100">
              Optional shipping protection insurance is available at checkout for 2% of order subtotal (minimum $2, maximum $50).
            </p>
          </div>

          <p className="mb-3"><strong>What Shipping Insurance Covers:</strong></p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Lost packages (never delivered, no scan at destination)</li>
            <li>Stolen packages (porch piracy, theft after delivery)</li>
            <li>Damaged products during transit (requires photographic evidence)</li>
            <li>Carrier delivery failures (package returned to sender, undeliverable)</li>
          </ul>

          <p className="mt-4 mb-3"><strong>What Shipping Insurance Does NOT Cover:</strong></p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Wrong shipping address provided by customer</li>
            <li>Customer refusal to accept delivery</li>
            <li>Packages held at carrier facility due to customer action/inaction</li>
            <li>Customs seizures or regulatory holds (if applicable)</li>
            <li>Weather delays or natural disasters</li>
            <li>Product quality issues unrelated to shipping damage</li>
          </ul>

          <div className="mt-4 rounded-lg border-2 border-amber-500 bg-amber-500/10 p-4">
            <p className="font-bold text-amber-200">WITHOUT INSURANCE:</p>
            <p className="mt-2 text-amber-100">
              If you decline shipping insurance, <strong>you assume ALL risk of loss or damage</strong> once the package leaves our facility.
              We will NOT replace or refund lost, stolen, or damaged packages if insurance was not purchased.
            </p>
          </div>

          <p className="mt-4"><strong>Insurance Claim Process:</strong></p>
          <ol className="list-decimal space-y-2 pl-6 mt-2">
            <li>Report issue within 48 hours of expected delivery date</li>
            <li>Provide order number and tracking information</li>
            <li>For damage: Submit photographs of damaged packaging AND product</li>
            <li>For theft: File police report (may be required for claims over $500)</li>
            <li>Claims processed within 5-7 business days</li>
          </ol>

          <p className="mt-3 text-sm text-charcoal-400">
            Insurance claims approved at sole discretion of MAHA Peptides. Fraudulent claims will result in permanent account termination and legal action.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">6. Tracking Information</h2>
          <p className="mb-3">
            You will receive a tracking number via email once your order ships. Tracking is typically updated within 24 hours of shipment.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Track packages using carrier's website (USPS, FedEx, UPS)</li>
            <li>Tracking updates are provided by the carrier, not MAHA Peptides</li>
            <li>We are not responsible for carrier tracking delays or inaccuracies</li>
            <li>Final delivery scan confirms delivery - we are not responsible after this point</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">7. Delivery and Transfer of Risk</h2>
          <div className="rounded-lg border-2 border-red-500 bg-red-500/10 p-4 mb-4">
            <p className="font-bold text-red-200">CRITICAL: READ CAREFULLY</p>
            <p className="mt-2 text-red-100">
              <strong>Risk of loss and title pass to you upon delivery to the shipping address OR upon the carrier's first delivery attempt.</strong>
            </p>
          </div>

          <p className="mb-3">This means:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Once the carrier marks package as "delivered," you own it - even if stolen afterward</li>
            <li>If you are not home and carrier leaves package, theft is YOUR responsibility (unless you purchased insurance)</li>
            <li>If carrier attempts delivery and you're not available, you are responsible for arranging redelivery</li>
            <li>If you refuse delivery, you forfeit the order with no refund</li>
            <li>Packages held at carrier facility due to your inaction are your responsibility</li>
          </ul>

          <p className="mt-4 font-semibold text-clinical-white">Delivery Signature Requirements:</p>
          <p className="mt-2">
            Orders over $500 may require signature confirmation at our discretion. If you will not be available to sign:
          </p>
          <ul className="list-disc space-y-2 pl-6 mt-2">
            <li>Arrange to ship to an address where someone can sign</li>
            <li>Pre-authorize signature release with the carrier (your responsibility)</li>
            <li>Pick up package at carrier facility using tracking number</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">8. Address Accuracy</h2>
          <p className="mb-3">
            <strong>You are responsible for providing an accurate, complete shipping address.</strong>
          </p>
          <p className="mb-3">We are NOT responsible for:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Packages shipped to incorrect addresses you provided</li>
            <li>Undeliverable packages due to incomplete or invalid addresses</li>
            <li>Delays caused by address corrections required by carrier</li>
            <li>Packages returned to sender due to bad address (you pay return shipping + reshipping)</li>
          </ul>

          <p className="mt-3 font-semibold text-clinical-white">Address Changes:</p>
          <p className="mt-2">
            Address changes may be accommodated ONLY if the order has not yet shipped. Once shipped, address changes are impossible.
            Contact support@mahapeps.com immediately if you need to change an address.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">9. Estimated Delivery Times</h2>
          <p className="mb-3">
            Estimated delivery times are provided for reference only and are NOT guaranteed. Actual delivery depends on:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Carrier service level selected</li>
            <li>Distance to destination</li>
            <li>Carrier operational delays</li>
            <li>Weather conditions</li>
            <li>Peak shipping seasons (holidays)</li>
            <li>Unforeseen circumstances</li>
          </ul>

          <p className="mt-3">
            <strong>General Delivery Timeframes (after shipment):</strong>
          </p>
          <ul className="list-disc space-y-2 pl-6 mt-2">
            <li>USPS Priority Mail: 2-3 business days</li>
            <li>USPS First Class: 3-5 business days</li>
            <li>FedEx/UPS Ground: 3-7 business days</li>
            <li>FedEx/UPS Express: 1-2 business days</li>
          </ul>

          <p className="mt-3 text-sm text-charcoal-400">
            Note: These are carrier estimates, not MAHA Peptides guarantees. Delays happen and are beyond our control.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">10. Shipment Delays and Carrier Issues</h2>
          <p className="mb-3">
            MAHA Peptides is NOT responsible for delays caused by:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Carrier operational issues (staffing shortages, facility delays)</li>
            <li>Weather events (storms, hurricanes, floods, snow)</li>
            <li>Natural disasters</li>
            <li>Carrier vehicle breakdowns or accidents</li>
            <li>Peak season volumes (holidays, Black Friday, etc.)</li>
            <li>Government shutdowns or regulatory holds</li>
            <li>Customs inspections (if applicable)</li>
            <li>Pandemics or public health emergencies</li>
          </ul>

          <p className="mt-3">
            Shipping delays do NOT entitle you to refunds, discounts, or compensation unless you purchased shipping insurance and the package is confirmed lost.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">11. Packaging and Discretion</h2>
          <p className="mb-3">
            All orders are packaged discreetly with no external markings indicating contents. Packages are labeled as "research materials" or similar generic description.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>No product names or company branding on exterior packaging</li>
            <li>Standard shipping boxes/envelopes with carrier labels only</li>
            <li>Sender name may be abbreviated or generic</li>
          </ul>

          <p className="mt-3 font-semibold text-clinical-white">Temperature-Sensitive Products:</p>
          <p className="mt-2">
            Some peptides require cold storage. If applicable, products may ship with cold packs or insulated packaging.
            We recommend immediate refrigeration upon receipt. We are NOT responsible for degradation due to carrier delays or your storage practices.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">12. International Shipping</h2>
          <p>
            <strong>We do NOT ship internationally.</strong> Do not request international shipment. All international shipments will be refused.
          </p>
          <p className="mt-2">
            Orders with international addresses will be cancelled with no refund.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">13. Refused or Unclaimed Packages</h2>
          <p className="mb-3">
            If you refuse delivery or fail to claim a package held at a carrier facility:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Package will be returned to sender at your expense</li>
            <li>You are responsible for return shipping charges PLUS original shipping charges</li>
            <li>No refund will be issued</li>
            <li>Restocking fees may apply</li>
          </ul>
          <p className="mt-3">
            Repeated refusals or abandoned packages may result in account termination and blacklisting.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">14. Missing or Damaged Items - Reporting Requirements</h2>
          <p className="mb-3">
            <strong>Time-sensitive reporting requirements:</strong>
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-charcoal-600 bg-charcoal-900/50 p-3">
              <p className="font-semibold text-clinical-white">Damaged Packages:</p>
              <p className="text-sm mt-1">Report within <strong>24 hours of delivery</strong> with photos of damaged exterior packaging AND damaged product.</p>
              <p className="text-sm mt-1 text-amber-200">Requires shipping insurance to be eligible for replacement.</p>
            </div>

            <div className="rounded-lg border border-charcoal-600 bg-charcoal-900/50 p-3">
              <p className="font-semibold text-clinical-white">Missing Items:</p>
              <p className="text-sm mt-1">Report within <strong>48 hours of delivery</strong> with photo of received items and packaging.</p>
              <p className="text-sm mt-1">Must show packing slip or order confirmation for comparison.</p>
            </div>

            <div className="rounded-lg border border-charcoal-600 bg-charcoal-900/50 p-3">
              <p className="font-semibold text-clinical-white">Lost Packages:</p>
              <p className="text-sm mt-1">Report within <strong>48 hours of expected delivery date</strong> per tracking.</p>
              <p className="text-sm mt-1 text-amber-200">Requires shipping insurance to be eligible for replacement.</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-charcoal-400">
            Reports submitted outside these timeframes will NOT be honored. Email support@mahapeps.com with order number, tracking number, and required photos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">15. Force Majeure</h2>
          <p>
            MAHA Peptides shall not be liable for any failure or delay in shipment due to circumstances beyond our reasonable control,
            including but not limited to: acts of God, war, terrorism, riots, civil unrest, strikes, government actions, carrier failures,
            natural disasters, pandemics, or utility failures.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-accent-400">16. Contact for Shipping Questions</h2>
          <p className="mb-3">
            For shipping-related questions or issues:
          </p>
          <p>
            <strong>Email:</strong> support@mahapeps.com<br />
            <strong>Include:</strong> Order number, tracking number, and detailed description of issue
          </p>
        </section>

        <div className="mt-12 rounded-lg border-2 border-accent-500 bg-accent-500/10 p-6">
          <p className="font-bold text-accent-200">SHIPPING POLICY SUMMARY:</p>
          <ul className="mt-3 space-y-2 text-accent-100">
            <li>✓ US shipping only (no international)</li>
            <li>✓ Processing times: 2 days (standard), 1 day ($25), same day ($50)</li>
            <li>✓ Shipping insurance HIGHLY recommended (2% fee)</li>
            <li>✓ Risk transfers to you upon delivery or first delivery attempt</li>
            <li>✓ NO refunds for shipping costs or processing fees</li>
            <li>✓ You are responsible for accurate shipping address</li>
            <li>✓ Strict reporting deadlines for damaged/lost packages (24-48 hours)</li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-charcoal-500">
          <strong>Last Updated:</strong> January 12, 2026<br />
          <strong>Version:</strong> 1.0
        </p>
      </div>
    </div>
  );
}
