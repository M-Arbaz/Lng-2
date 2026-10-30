
import { jsPDF } from 'jspdf'

const BRAND = {
    name: 'LAMP AND GLOW',
    dark: [58, 33, 23],
    brown: [107, 66, 40],
    muted: [125, 105, 92],
    line: [229, 220, 211],
    cream: [247, 244, 239],
    pale: [242, 236, 229],
    green: [44, 116, 77],
    red: [160, 65, 54],
    white: [255, 255, 255],
}

const PAGE = {
    width: 210,
    height: 297,
    left: 14,
    right: 196,
}

function toNumber(value, fallback = 0) {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}

function safeText(value, maxLength = 180) {
    return String(value ?? '')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength)
}

function money(value) {
    return `Rs. ${Math.round(toNumber(value)).toLocaleString('en-PK')}`
}

function toDate(value) {
    if (!value) return null

    try {
        if (typeof value?.toDate === 'function') {
            return value.toDate()
        }

        if (typeof value?.seconds === 'number') {
            return new Date(value.seconds * 1000)
        }

        const date = new Date(value)

        return Number.isNaN(date.getTime())
            ? null
            : date
    } catch {
        return null
    }
}

function formatDate(value) {
    const date = toDate(value)

    if (!date) return 'Date unavailable'

    return date.toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function formatPaymentMethod(value) {
    const method = safeText(value)
        .toLowerCase()
        .replace(/[\s-]+/g, '_')

    if (
        ['cod', 'cash_on_delivery'].includes(method)
    ) {
        return 'Cash on Delivery'
    }

    if (
        [
            'bank',
            'bank_transfer',
            'bank_deposit',
        ].includes(method)
    ) {
        return 'Bank Transfer'
    }

    return method
        ? method
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'Not specified'
}

function normalizeItems(order) {
    const source = Array.isArray(order?.items)
        ? order.items
        : []

    return source.map((item, index) => {
        const quantity = Math.max(
            1,
            toNumber(item?.quantity, 1)
        )

        const unitPrice = Math.max(
            0,
            toNumber(
                item?.unitPrice ??
                item?.price ??
                item?.product?.price,
                0
            )
        )

        const name = safeText(
            item?.name ||
            item?.productName ||
            item?.product?.name ||
            item?.product?.productName ||
            `Product ${index + 1}`,
            100
        )

        const optionValue = (value) => {
            if (value == null || value === '') return ''

            if (
                typeof value === 'string' ||
                typeof value === 'number'
            ) {
                return safeText(value, 50)
            }

            if (Array.isArray(value)) {
                return safeText(value.join(', '), 70)
            }

            return safeText(
                value.name ||
                value.label ||
                value.value ||
                '',
                50
            )
        }

        const options = [
            item?.colorVariant
                ? `Color: ${optionValue(item.colorVariant)}`
                : '',

            item?.shadeColor
                ? `Shade: ${optionValue(item.shadeColor)}`
                : '',

            item?.bulbOption
                ? `Bulb: ${optionValue(item.bulbOption)}`
                : '',
        ].filter(Boolean)

        return {
            name,
            quantity,
            unitPrice,
            lineTotal: unitPrice * quantity,
            options,
        }
    })
}

function getInvoiceAmounts(order, items) {
    const calculatedSubtotal = items.reduce(
        (sum, item) => sum + item.lineTotal,
        0
    )

    const subtotal = Math.max(
        0,
        toNumber(order?.subtotal, calculatedSubtotal)
    )

    const bankDiscount = Math.max(
        0,
        toNumber(order?.bankTransferDiscountAmount, 0)
    )

    const combinedDiscount = Math.max(
        0,
        toNumber(order?.discountAmount, 0)
    )

    // New orders save coupon and bank discounts separately.
    // Older orders may only contain discountAmount.
    const couponDiscount = Math.max(
        0,
        toNumber(
            order?.couponDiscountAmount,
            Math.max(0, combinedDiscount - bankDiscount)
        )
    )

    const shipping = Math.max(
        0,
        toNumber(
            order?.shipping ??
            order?.shippingMethod?.fee ??
            order?.shippingFee,
            0
        )
    )

    const calculatedDiscountedSubtotal = Math.max(
        0,
        subtotal - couponDiscount - bankDiscount
    )

    const discountedSubtotal = Math.max(
        0,
        toNumber(
            order?.discountedSubtotal,
            calculatedDiscountedSubtotal
        )
    )

    const total = Math.max(
        0,
        toNumber(
            order?.total,
            discountedSubtotal + shipping
        )
    )

    const paymentDetails = order?.paymentDetails || {}

    const paymentStatus = safeText(
        order?.paymentStatus ||
        order?.payment?.status
    ).toLowerCase()

    const isCod = [
        'cod',
        'cash_on_delivery',
        'cash on delivery',
    ].includes(
        safeText(order?.paymentMethod).toLowerCase()
    )

    const codAdvance = Math.max(
        0,
        toNumber(
            paymentDetails.codAdvanceAmount ??
            order?.codAdvanceAmount ??
            order?.advanceAmount,
            0
        )
    )

    const storedCodRemaining =
        paymentDetails.codRemainingAmount ??
        order?.codRemainingAmount

    const codRemaining = Math.max(
        0,
        toNumber(
            storedCodRemaining,
            total - codAdvance
        )
    )

    const amountPaid = Math.max(
        0,
        toNumber(
            order?.amountPaid ??
            order?.paidAmount ??
            paymentDetails.amountPaid,
            0
        )
    )

    return {
        subtotal,
        couponDiscount,
        bankDiscount,
        shipping,
        discountedSubtotal,
        total,
        isCod,
        codAdvance,
        codRemaining:
            paymentStatus === 'paid'
                ? 0
                : codRemaining,
        paymentStatus,
        amountPaid,
        bankAmountDue:
            paymentStatus === 'paid'
                ? 0
                : Math.max(0, total - amountPaid),
    }
}

async function loadLogoDataUrl(url) {
    if (
        typeof window === 'undefined' ||
        typeof document === 'undefined'
    ) {
        return null
    }

    let objectUrl = ''

    try {
        const response = await fetch(url, {
            cache: 'force-cache',
        })

        if (!response.ok) return null

        const blob = await response.blob()

        objectUrl = URL.createObjectURL(blob)

        const image = new Image()
        image.decoding = 'async'
        image.src = objectUrl

        await new Promise((resolve, reject) => {
            image.onload = resolve
            image.onerror = reject
        })

        const canvas = document.createElement('canvas')

        const ratio = Math.min(
            1,
            600 / Math.max(
                image.naturalWidth,
                image.naturalHeight
            )
        )

        canvas.width = Math.max(
            1,
            Math.round(image.naturalWidth * ratio)
        )

        canvas.height = Math.max(
            1,
            Math.round(image.naturalHeight * ratio)
        )

        const context = canvas.getContext('2d')

        if (!context) return null

        context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        )

        return canvas.toDataURL('image/png')
    } catch (error) {
        console.warn(
            'Invoice logo could not be loaded. Using text branding instead.',
            error
        )

        return null
    } finally {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
        }
    }
}

function drawFooter(doc, pageNumber, pageCount) {
    const y = 282

    doc.setDrawColor(...BRAND.line)
    doc.setLineWidth(0.25)
    doc.line(PAGE.left, y, PAGE.right, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...BRAND.muted)

    doc.text(
        'Thank you for shopping with Lamp AND Glow.',
        PAGE.left,
        288
    )

    doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        PAGE.right,
        288,
        { align: 'right' }
    )
}

function drawTableHeader(doc, y) {
    doc.setFillColor(...BRAND.dark)

    doc.roundedRect(
        PAGE.left,
        y,
        PAGE.right - PAGE.left,
        9,
        1.5,
        1.5,
        'F'
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...BRAND.white)

    doc.text('PRODUCT', 17, y + 5.8)
    doc.text('QTY', 120, y + 5.8, {
        align: 'center',
    })
    doc.text('UNIT PRICE', 164, y + 5.8, {
        align: 'right',
    })
    doc.text('AMOUNT', 193, y + 5.8, {
        align: 'right',
    })

    return y + 9
}

function drawKeyValue(
    doc,
    label,
    value,
    x,
    y,
    width,
    options = {}
) {
    const {
        bold = false,
        color = BRAND.dark,
        labelColor = BRAND.muted,
        size = 8,
    } = options

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...labelColor)
    doc.text(label, x, y)

    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    doc.text(
        safeText(value, 70),
        x + width,
        y,
        { align: 'right' }
    )
}

export async function downloadOrderInvoice(
    order,
    options = {}
) {
    if (!order || typeof order !== 'object') {
        throw new Error(
            'Order information is not available for this invoice.'
        )
    }

    const orderId = safeText(
        order.id ||
        order._id ||
        order.orderId,
        80
    )

    if (!orderId) {
        throw new Error(
            'This order does not have an order number yet.'
        )
    }

    const items = normalizeItems(order)
    const amounts = getInvoiceAmounts(order, items)

    const dateValue =
        order.createdAt ||
        order.date ||
        new Date().toISOString()

    const paymentMethod = formatPaymentMethod(
        order.paymentMethod
    )

    const paymentStatusLabel = amounts.paymentStatus
        ? amounts.paymentStatus
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'Pending'

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
    })

    const logoData = await loadLogoDataUrl(
        options.logoUrl || '/logo.png'
    )

    // Header
    doc.setFillColor(...BRAND.dark)
    doc.rect(
        0,
        0,
        PAGE.width,
        42,
        'F'
    )
    if (logoData) {
        try {
            // Light background for logo contrast
            doc.setFillColor(...BRAND.cream)
            doc.setDrawColor(...BRAND.line)

            doc.roundedRect(
                14,
                7,
                29,
                29,
                3,
                3,
                'FD'
            )

            // Larger logo with square proportions preserved
            doc.addImage(
                logoData,
                'PNG',
                15.5,
                8.5,
                26,
                26,
                'lamp-glow-logo',
                'FAST'
            )
        } catch (error) {
            console.warn(
                'Invoice logo could not be embedded.',
                error
            )
        }
    }

    const wordmarkX = logoData ? 49 : 15


    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...BRAND.white)
    doc.text(
        BRAND.name,
        wordmarkX,
        19
    )

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(226, 211, 199)

    doc.text(
        'ORDER DETAILS & PAYMENT SUMMARY',
        wordmarkX + 0.3,
        25
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...BRAND.white)
    doc.text(
        'INVOICE',
        196,
        17,
        { align: 'right' }
    )

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(236, 224, 214)

    doc.text(
        `Order #${orderId}`,
        196,
        25,
        { align: 'right' }
    )

    doc.text(
        `Issued ${formatDate(dateValue)}`,
        196,
        31,
        { align: 'right' }
    )

    // Customer and delivery information
    const cardY = 50
    const cardHeight = 37
    const cardWidth = 88

    const drawInfoCard = (x, title, lines) => {
        doc.setFillColor(...BRAND.cream)
        doc.setDrawColor(...BRAND.line)

        doc.roundedRect(
            x,
            cardY,
            cardWidth,
            cardHeight,
            2.5,
            2.5,
            'FD'
        )

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...BRAND.brown)

        doc.text(
            title,
            x + 5,
            cardY + 7
        )

        let cursorY = cardY + 13

        lines
            .filter(Boolean)
            .slice(0, 4)
            .forEach((line, index) => {
                doc.setFont(
                    'helvetica',
                    index === 0 ? 'bold' : 'normal'
                )

                doc.setFontSize(index === 0 ? 8 : 7)

                doc.setTextColor(
                    ...(index === 0
                        ? BRAND.dark
                        : BRAND.muted)
                )

                const wrapped = doc
                    .splitTextToSize(
                        safeText(line, 120),
                        cardWidth - 10
                    )
                    .slice(0, 2)

                doc.text(
                    wrapped,
                    x + 5,
                    cursorY
                )

                cursorY +=
                    wrapped.length *
                    (index === 0 ? 3.8 : 3.3)
            })
    }

    const fullName = safeText(
        order.fullName ||
        order.customerName ||
        order.name,
        100
    ) || 'Customer'

    const deliveryAddress =
        order.shippingAddress || order

    const billingAddress =
        order.billingSameAsShipping === false &&
            order.billingAddress
            ? order.billingAddress
            : deliveryAddress

    const billingAddressText = [
        billingAddress.addressLine1,
        billingAddress.addressLine2,
        [
            billingAddress.city,
            billingAddress.state,
            billingAddress.postalCode,
        ]
            .filter(Boolean)
            .join(', '),
    ]
        .filter(Boolean)
        .join(', ')

    const customerLines = [
        fullName,
        order.phone,
        order.email,
        billingAddressText
            ? `Billing: ${billingAddressText}`
            : '',
    ]

    const addressLines = [
        deliveryAddress.addressLine1 ||
        deliveryAddress.address ||
        order.address,

        deliveryAddress.addressLine2,

        [
            deliveryAddress.city || order.city,
            deliveryAddress.state || order.state,
            deliveryAddress.postalCode || order.postalCode,
        ]
            .filter(Boolean)
            .join(', '),
    ]

    drawInfoCard(
        14,
        'BILL TO',
        customerLines
    )

    drawInfoCard(
        108,
        'DELIVER TO',
        addressLines
    )

    // Order metadata
    const metaY = 95

    const meta = [
        ['PAYMENT METHOD', paymentMethod],

        [
            'DELIVERY METHOD',
            [
                order.shippingMethod?.name ||
                order.shippingMethodName ||
                'Standard delivery',
                order.deliveryEstimate,
            ]
                .filter(Boolean)
                .join(' · '),
        ],

        [
            'ORDER STATUS',
            safeText(order.status || 'pending')
                .replace(/_/g, ' ')
                .toUpperCase(),
        ],

        [
            'PAYMENT STATUS',
            paymentStatusLabel.toUpperCase(),
        ],
    ]

    meta.forEach(([label, value], index) => {
        const x = 14 + index * 46

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(...BRAND.muted)
        doc.text(label, x, metaY)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...BRAND.dark)

        const wrapped = doc
            .splitTextToSize(
                safeText(value, 80),
                42
            )
            .slice(0, 2)

        doc.text(
            wrapped,
            x,
            metaY + 5
        )
    })

    // Products table
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...BRAND.dark)
    doc.text('ORDER ITEMS', 14, 113)

    let y = drawTableHeader(doc, 117)

    if (items.length === 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...BRAND.muted)

        doc.text(
            'No item details were saved for this order.',
            17,
            y + 7
        )

        y += 15
    } else {
        items.forEach((item, index) => {
            const titleLines = doc
                .splitTextToSize(item.name, 82)
                .slice(0, 2)

            const optionLines = item.options
                .flatMap((option) =>
                    doc.splitTextToSize(option, 82)
                )
                .slice(0, 3)

            const rowHeight = Math.max(
                12,
                titleLines.length * 4 +
                optionLines.length * 3.3 +
                5
            )

            if (y + rowHeight > 264) {
                doc.addPage()
                y = 18
                y = drawTableHeader(doc, y)
            }

            if (index % 2 === 0) {
                doc.setFillColor(250, 248, 245)
                doc.rect(
                    14,
                    y,
                    182,
                    rowHeight,
                    'F'
                )
            }

            doc.setDrawColor(...BRAND.line)
            doc.setLineWidth(0.2)

            doc.line(
                14,
                y + rowHeight,
                196,
                y + rowHeight
            )

            let textY = y + 5

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7.5)
            doc.setTextColor(...BRAND.dark)

            doc.text(
                titleLines,
                17,
                textY
            )

            textY += titleLines.length * 4

            if (optionLines.length) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(6.5)
                doc.setTextColor(...BRAND.muted)

                doc.text(
                    optionLines,
                    17,
                    textY
                )
            }

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.setTextColor(...BRAND.dark)

            doc.text(
                String(item.quantity),
                120,
                y + rowHeight / 2 + 1,
                { align: 'center' }
            )

            doc.text(
                money(item.unitPrice),
                164,
                y + rowHeight / 2 + 1,
                { align: 'right' }
            )

            doc.setFont('helvetica', 'bold')

            doc.text(
                money(item.lineTotal),
                193,
                y + rowHeight / 2 + 1,
                { align: 'right' }
            )

            y += rowHeight
        })
    }

    // Financial summary
    const summaryHeight = amounts.isCod ? 76 : 67

    if (y + summaryHeight > 270) {
        doc.addPage()
        y = 20
    } else {
        y += 7
    }

    const summaryX = 91
    const summaryW = 105
    const summaryY = y

    doc.setFillColor(...BRAND.cream)
    doc.setDrawColor(...BRAND.line)

    doc.roundedRect(
        summaryX,
        summaryY,
        summaryW,
        amounts.isCod ? 48 : 43,
        2.5,
        2.5,
        'FD'
    )

    let summaryLineY = summaryY + 8

    drawKeyValue(
        doc,
        'Subtotal',
        money(amounts.subtotal),
        summaryX + 5,
        summaryLineY,
        summaryW - 10
    )

    summaryLineY += 7

    if (amounts.couponDiscount > 0) {
        const couponCode = safeText(
            order.coupon?.code ||
            order.couponCode,
            30
        )

        drawKeyValue(
            doc,
            couponCode
                ? `Coupon (${couponCode})`
                : 'Coupon discount',
            `- ${money(amounts.couponDiscount)}`,
            summaryX + 5,
            summaryLineY,
            summaryW - 10,
            {
                color: BRAND.green,
            }
        )

        summaryLineY += 7
    }

    if (amounts.bankDiscount > 0) {
        const percent = toNumber(
            order.bankTransferDiscountPercent
        )

        const label = percent > 0
            ? `Bank transfer discount (${percent}%)`
            : 'Bank transfer discount'

        drawKeyValue(
            doc,
            label,
            `- ${money(amounts.bankDiscount)}`,
            summaryX + 5,
            summaryLineY,
            summaryW - 10,
            {
                color: BRAND.green,
                size: 7,
            }
        )

        summaryLineY += 7
    }

    drawKeyValue(
        doc,
        'Shipping',
        amounts.shipping === 0
            ? 'FREE'
            : money(amounts.shipping),
        summaryX + 5,
        summaryLineY,
        summaryW - 10,
        {
            color: amounts.shipping === 0
                ? BRAND.green
                : BRAND.dark,
        }
    )

    summaryLineY += 7

    doc.setDrawColor(...BRAND.line)

    doc.line(
        summaryX + 5,
        summaryLineY - 3,
        summaryX + summaryW - 5,
        summaryLineY - 3
    )

    drawKeyValue(
        doc,
        'ORDER TOTAL',
        money(amounts.total),
        summaryX + 5,
        summaryLineY + 2,
        summaryW - 10,
        {
            bold: true,
            size: 10,
        }
    )

    // Payment due banner
    const dueY = summaryY + (
        amounts.isCod ? 53 : 48
    )

    doc.setFillColor(...BRAND.dark)

    doc.roundedRect(
        14,
        dueY,
        182,
        19,
        2.5,
        2.5,
        'F'
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(226, 211, 199)

    let dueLabel = 'AMOUNT TO PAY'
    let dueAmount = amounts.bankAmountDue

    if (amounts.isCod) {
        dueLabel = 'REMAINING AMOUNT TO PAY ON DELIVERY'
        dueAmount = amounts.codRemaining
    } else if (amounts.paymentStatus === 'paid') {
        dueLabel = 'PAYMENT RECEIVED'
        dueAmount = 0
    } else if (
        [
            'bank',
            'bank_transfer',
            'bank deposit',
            'bank_deposit',
        ].includes(
            safeText(order.paymentMethod).toLowerCase()
        )
    ) {
        dueLabel = 'AMOUNT TO PAY BY BANK TRANSFER'
    }

    doc.text(
        dueLabel,
        19,
        dueY + 7
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...BRAND.white)

    doc.text(
        money(dueAmount),
        191,
        dueY + 12,
        { align: 'right' }
    )

    // Additional payment information
    let noteY = dueY + 26

    if (amounts.isCod) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...BRAND.muted)

        const codNote =
            `Order total: ${money(amounts.total)}` +
            (
                amounts.codAdvance > 0
                    ? `  |  COD advance requirement: ${money(amounts.codAdvance)}`
                    : ''
            )

        doc.text(codNote, 14, noteY)

        noteY += 5
    } else if (
        amounts.amountPaid > 0 &&
        amounts.paymentStatus !== 'paid'
    ) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...BRAND.muted)

        doc.text(
            `Payment recorded: ${money(amounts.amountPaid)}  |  Status: ${paymentStatusLabel}`,
            14,
            noteY
        )

        noteY += 5
    }

    // Delivery note
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...BRAND.muted)

    const deliveryNote = safeText(
        order.note || order.deliveryNote,
        160
    )

    const note = deliveryNote
        ? `Delivery note: ${deliveryNote}. Please keep this invoice for your records.`
        : 'Please keep this invoice for your records. For order support, contact the store using the contact details shown on its website.'

    const noteLines = doc
        .splitTextToSize(note, 182)
        .slice(0, 3)

    doc.text(
        noteLines,
        14,
        noteY + 2
    )

    // Page numbers
    const pageCount = doc.getNumberOfPages()

    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page)
        drawFooter(doc, page, pageCount)
    }

    const safeOrderId = orderId.replace(
        /[^a-zA-Z0-9-_]/g,
        '-'
    )

    doc.save(
        `Lamp-and-Glow-Invoice-${safeOrderId}.pdf`
    )
}

export default downloadOrderInvoice
