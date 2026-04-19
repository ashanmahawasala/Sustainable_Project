// src/utils/shapeUser.js

export function shapeUserResponse(user) {
  if (!user) return null;

  const base = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // Only add role specific stuff
  if (user.role === "RECYCLER") {
    base.recyclerDetails = user.recyclerDetails;
  }

  if (user.role === "ADMIN") {
    base.adminDetails = user.adminDetails; // or only permissions if you want
  }

  return base;
}