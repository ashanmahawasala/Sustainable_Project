// backend/middlewares/mockUser.js
export const mockUser = (req, res, next) => {
  const role = req.headers["x-role"] || "user"; // default user

  req.user = {
    _id: "64123456789abcdef1234567",
    name: "Test User",
    email: "test@example.com",
    role: role,
  };

  next();
};