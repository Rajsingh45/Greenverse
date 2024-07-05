const User = require('../models/USER');
const Admin = require('../models/ADMIN')

const addUser = async (req, res) => {
    const { name, email, noofdevices, deviceIPs } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'Email does not exists' });
        }

        const newUser = new Admin({ name, email, noofdevices,deviceIPs, role: 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await Admin.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getDevicesNumber=async(req,res)=>{
    try {
            const admin = await Admin.findOne({ email: req.user.email }); // Assuming req.user.email contains the logged-in admin's email
            if (!admin) {
              return res.status(404).json({ error: 'Admin not found' });
            }
            res.json({ noofdevices: admin.noofdevices });
          } catch (error) {
             console.error('Error fetching admin devices:', error);
             res.status(500).json({ error: 'Server error' });
           }
}

const checkEmailExists=async(req,res)=>{
    const { email } = req.body;
        try {
          const user = await User.findOne({ email });
          if (user) {
            res.json({ exists: true });
          } else {
            res.json({ exists: false });
          }
        } catch (error) {
          res.status(500).json({ error: 'Server error' });
        }
      };

const updateUserDevices = async (req, res) => {
    const { email } = req.params; // Assuming email is passed as a parameter in the URL
    const { noofdevices} = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        existingUser.noofdevices = noofdevices;
        await existingUser.save();

        res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteUser = async (req, res) => {
  const { email } = req.body;

  try {
      const existingUser = await Admin.findOneAndDelete({ email });
      if (!existingUser) {
          return res.status(400).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { addUser, getAllUsers, updateUserDevices, getDevicesNumber, checkEmailExists, deleteUser };