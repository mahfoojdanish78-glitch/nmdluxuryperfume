const Razorpay = require("razorpay");

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

        const amount = Number(body.amount);

        if (!amount || amount <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid order amount"
                })
            };
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const order = await razorpay.orders.create({

            amount: Math.round(amount * 100),

            currency: "INR",

            receipt:
                "NMD_" +
                Date.now(),

            notes: {
                customer_name:
                    body.customer?.name || "",

                customer_phone:
                    body.customer?.phone || "",

                customer_email:
                    body.customer?.email || "",

                pincode:
                    body.customer?.pincode || ""
            }

        });

        return {
            statusCode: 200,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                success: true,

                order_id:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency

            })
        };

    } catch (error) {

        console.error(
            "Create Order Error:",
            error
        );

        return {
            statusCode: 500,

            body: JSON.stringify({

                success: false,

                message:
                    "Unable to create payment order"

            })
        };

    }

};
