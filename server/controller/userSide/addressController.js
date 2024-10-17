const addressDb = require('../../model/addressSchema');
const mongoose = require("mongoose");


exports.showDefaultAddress = async (req, res, next) => {
    console.log('show def');
    
    const userId = req.query.userId;
    try {
        const result = await addressDb.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $project: {
                    address: {
                        $filter: {
                            input: '$address',
                            as: 'addr',
                            cond: { $eq: ['$$addr._id', '$defaultAddress'] }
                        }
                    }
                }
            },
            {
                $unwind: '$address'
            },
            {
                $project: {
                    _id: 0,
                    username: '$address.username',
                    structuredAddress: '$address.structuredAddress',
                    addressId: '$address._id'
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Default address not found.' });
        }
        console.log('add def ret');

        res.status(200).json(result[0]);

    } catch (err) {
        // console.log(err);
        // res.status(500).send("internal server error");
        next(err)
    }
}


exports.addAddress = async (req, res) => {
    try {
        const userId = req.query.userId;
        const { username, phone, street, block, unitnum, postal } = req.body;
        const structuredAddress = `${username}, ${phone}, ${street}, ${block}, ${unitnum}, ${postal}`;

        if (!username || !phone || !street || !block || !unitnum || !postal) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        const userAddress = await addressDb.findOne({ userId });

        if (userAddress) {
            userAddress.address.push({
                _id: new mongoose.Types.ObjectId(),
                username,
                phone,
                street,
                block,
                unitnum,
                postal,
                structuredAddress
            });

            const updatedAddress = await userAddress.save();

            res.status(200).json({
                message: 'Address added successfully!',
                address: updatedAddress
            });
        } else {
            const newAddress = new addressDb({
                userId,
                address: [{
                    _id: new mongoose.Types.ObjectId(),
                    username,
                    phone,
                    street,
                    block,
                    unitnum,
                    postal,
                    structuredAddress
                }],
                defaultAddress: null
            });

            const savedAddress = await newAddress.save();
            res.status(201).json({
                message: 'Address added successfully!',
                address: savedAddress
            });
        }
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({
            message: 'Server error, please try again later.'
        });
    }
};



exports.showAddress = async (req, res, next) => {
    const userId = req.query.userId;
    try {
        const userAddresses = await addressDb.findOne({ "userId": userId }).populate('defaultAddress');

        if (userAddresses && userAddresses.address) {
            const addressList = userAddresses.address.map(address => ({
                _id: address._id,
                structuredAddress: address.structuredAddress,
                isDefault: String(userAddresses.defaultAddress._id) === String(address._id)
            }));

            res.status(200).json(addressList);
        } else {
            res.status(404).json({ message: "No addresses found for this user." });
        }
    } catch (err) {
        next(err);
    }
};


exports.updateDefaultAddress = async (req, res, next) => {
    const { userId, addressId } = req.body;
    try {
        const userAddresses = await addressDb.findOne({ userId });

        if (!userAddresses) {
            return res.status(404).json({ message: 'User not found or no addresses available.' });
        }

        const addressExists = userAddresses.address.some(addr => addr._id.toString() === addressId);
        if (!addressExists) {
            return res.status(400).json({ message: 'Address not found.' });
        }

        userAddresses.defaultAddress = addressId;

        await userAddresses.save();

        res.status(200).json({ message: 'Default address updated successfully.' });
    } catch (error) {
        console.error('Error updating default address:', error);
        res.status(500).json({ message: 'Internal server error.', error });
    }
}

exports.deleteAddress = async (req, res, next) => {
    const userId = req.query.userId
    const { addressId } = req.body;
    try {
        const result = await addressDb.updateOne(
            { userId: userId },
            { $pull: { address: { _id: addressId } } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Address deleted successfully' });
        } else {
            res.status(404).json({ error: 'Address not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete the address' });
    }
}


exports.getAddress = async (req, res) => {
    const { userId, addressId } = req.query;
    console.log(req.query);

    try {
        const user = await addressDb.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the specific address within the user's address array
        const address = user.address.id(addressId);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        console.log(address);
        res.status(200).json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.updateAddress = async (req, res) => {
    const { addressId, updatedData } = req.body;
    const { username, phone, street, block, unitnum, postal } = updatedData;

    // Construct the structured address
    const structuredAddress = `${username}, ${phone}, ${street}, ${block}, ${unitnum}, ${postal}`;

    try {
        const updatedAddress = await addressDb.findOneAndUpdate(
            { "address._id": addressId },
            {
                $set: {
                    "address.$": {
                        ...updatedData,
                        structuredAddress
                    }
                }
            },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.showAddressManagement = async (req, res) => {
    const userId = req.query.userId;
    console.log(userId);
    
    try {
        const userAddresses = await addressDb.findOne({ "userId": userId }).populate('defaultAddress');
        console.log(userAddresses);
        
        if (userAddresses && userAddresses.address) {
            const addressList = userAddresses.address.map(address => ({
                _id: address._id,
                phone: address.phone,
                username: address.username,
                street: address.street,
                block: address.block,
                unitnum: address.unitnum,
                postal: address.postal,
                structuredAddress: address.structuredAddress,
                isDefault: String(userAddresses.defaultAddress._id) === String(address._id)
            }));
            console.log(addressList);
            
            res.status(200).json(addressList);
        } else {
            res.status(404).json({ message: "No addresses found for this user." });
        }
    } catch (err) {
        console.log(err);
    }
}

