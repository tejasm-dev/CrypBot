const Users = require('./UserModel');  // importing user model

module.exports = async function saveUser(telegramID, firstname) {
    // Function to save user data in MongoDB using Mongoose
    try {
        // Check if user already exists in the database
        const existingUser = await Users.findOne({ telegramID });

        if (existingUser) {
            // If user exists, update the lastMessage field

            Users.findOneAndUpdate(
                { telegramID },
                { $set: { lastMessage: getCurrentDate() },
                }).then(() => { }).catch(() => { });

            return;
        }

        // Create a new user instance
        const newUser = new Users({
            telegramID: telegramID,
            firstname: firstname,
            lastMessage: getCurrentDate(),
            joined: getCurrentDate(),  // Set the joined date to the current date
        });

        // Save the new user to the database
        await newUser.save()
            .then(() => { })
            .catch(() => { });
    }
    // If error, do nothing!
    catch (err) { }
}

function getCurrentDate() {
    // Function to get the current date in Indian Standard Timezone

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
    return new Date(now.getTime() + istOffset);
}