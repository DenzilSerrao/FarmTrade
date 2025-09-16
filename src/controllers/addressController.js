import Address from '../models/Address.js';

class AddressController {
  // Get user's saved addresses
  async getUserAddresses(req, res) {
    try {
      const userId = req.user.id;
      
      const addresses = await Address.find({
        userId,
        isActive: true,
      }).sort({ isDefault: -1, createdAt: -1 });

      res.json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses',
      });
    }
  }

  // Create new address
  async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = { ...req.body, userId };

      // If this is set as default, unset other default addresses
      if (addressData.isDefault) {
        await Address.updateMany(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }

      const address = new Address(addressData);
      await address.save();

      res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: address,
      });
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create address',
      });
    }
  }

  // Update address
  async updateAddress(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // If setting as default, unset other default addresses
      if (updateData.isDefault) {
        await Address.updateMany(
          { userId, _id: { $ne: addressId }, isDefault: true },
          { isDefault: false }
        );
      }

      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update address',
      });
    }
  }

  // Delete address
  async deleteAddress(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { isActive: false },
        { new: true }
      );

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address',
      });
    }
  }

  // Get specific address
  async getAddress(req, res) {
    try {
      const { addressId } = req.params;
      const userId = req.user.id;

      const address = await Address.findOne({
        _id: addressId,
        userId,
        isActive: true,
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch address',
      });
    }
  }
}

export default new AddressController();