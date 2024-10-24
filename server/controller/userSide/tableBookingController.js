const tableDb = require("../../model/tableBookingSchema");

exports.bookTable = async (req, res) => {
    const { name, email, phone, message } = req.body;
    console.log(req.body);
    const errors = {};

    // Server-side validation
    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required.";
    if (!phone) errors.phone = "Phone number is required.";
    if (!message) errors.message = "Message is required.";

    // If there are any validation errors, return them to the frontend
    if (Object.keys(errors).length > 0) {
        // Store errors in session or directly send response
        req.session.errors = errors;
        return res.status(400).json({ errors });
    }

    try {
        const newBooking = new tableDb({
            name,
            email,
            phone,
            message
        });

        await newBooking.save();
        res.status(200).json({ message: 'Table booked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error booking table', error });
    }
}

// exports.bookTable = async (req, res) => {
//     try {
//         const newBooking = new tableDb({
//             name: req.body.name,
//             email: req.body.email,
//             phone: req.body.phone,
//             message: req.body.message
//         });

//         await newBooking.save();
//         res.status(200).json({ message: 'Table booked successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error booking table', error });
//     }
// }