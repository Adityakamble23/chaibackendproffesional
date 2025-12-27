import { asynchander } from "../utils/asynchander.js";

const registerUser = asynchander(async (req, res) => {
  res.status(200).json({ message: "chai or code aditya codign  " });
});

export { registerUser };
