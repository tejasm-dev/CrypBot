const Users = require('./UserModel');  // importing user model

module.exports = async function saveUser(telegramID, firstname, username) {
    // Function to save user data in MongoDB using Mongoose

    try {
        // Check if user already exists in the database
        const existingUser = await Users.findOne({ telegramID });

        if (existingUser) {
            return;
        }

        // Create a new user instance
        const newUser = new Users({
            telegramID: telegramID,
            firstname: firstname,
            username: username
        });

        // Save the new user to the database
        await newUser.save()
            .then(() => {})
            .catch(() => {});
    }
    // If error, do nothing!
    catch (err) { }
}