// TEMP FRONTEND MOCK
// Replace with backend API later

export const loginUser = (email, password) => {
  if (email === "admin@gmail.com" && password === "admin123") {
    return {
      role: "ADMIN",
      status: "APPROVED",
      name: "Admin",
    };
  }

  if (email && password) {
    return {
      role: "USER",
      status: "PENDING", // admin must approve
      name: "User",
    };
  }

  return null;
};

export const registerUser = (data) => {
  return { success: true, status: "PENDING" };
};
