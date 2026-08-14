const crypto = require("crypto");

exports.handler = async (event) => {

    try {

        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({
                    message: "Method not allowed"
                })
            };
        }

        const body = JSON.parse(event.body || "{}");

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            customer,
            items,
            total
        } = body;


        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Payment details missing"
                })
            };
        }


        /* =========================
           VERIFY RAZORPAY SIGNATURE
        ========================= */

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return {
                statusCode: 400,

                body: JSON.stringify({
                    success: false,
                    message:
                        "Payment verification failed"
                })
            };

        }


        /* =========================
           ORDER EMAIL CONTENT
        ========================= */

        const productList =
            Array.isArray(items)
                ? items.map(item => {

                    return `
                        ${item.name}
                        × ${item.quantity}
                        = ₹${item.price * item.quantity}
                    `;

                }).join("\n")
                : "No product information";


        const orderMessage = `

NMD LUXURY PERFUME
NEW PAID ORDER
==============================

Customer Name:
${customer?.name || ""}

Mobile:
${customer?.phone || ""}

Email:
${customer?.email || ""}

Full Address:
${customer?.address || ""}

Pincode:
${customer?.pincode || ""}


PRODUCTS
==============================

${productList}


TOTAL:
₹${total || 0}


PAYMENT DETAILS
==============================

Razorpay Order ID:
${razorpay_order_id}

Payment ID:
${razorpay_payment_id}

Payment Status:
PAID

==============================

NMD LUXURY PERFUME
`;


        /*
         IMPORTANT:

         Payment verification is complete.

         Email sending will be connected
         separately through a secure email
         service / Netlify environment.
        */


        console.log(orderMessage);


        return {

            statusCode: 200,

            body: JSON.stringify({

                success: true,

                message:
                    "Payment verified successfully",

                order_id:
                    razorpay_order_id,

                payment_id:
                    razorpay_payment_id

            })

        };


    } catch (error) {

        console.error(
            "Verify Payment Error:",
            error
        );


        return {

            statusCode: 500,

            body: JSON.stringify({

                success: false,

                message:
                    "Payment verification error"

            })

        };

    }

};